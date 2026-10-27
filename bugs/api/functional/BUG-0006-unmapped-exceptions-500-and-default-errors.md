# BUG-0006: Unmapped exceptions return 500 or framework default error bodies

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API] Global exception handling misses common failure types, producing 500s, Spring default bodies and leaked internal messages |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API (global), API / Users, API / Cart, API / Products |
| Labels | api, error-handling, contract |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

The global exception handler covers bean-validation errors, `CustomException`,
access denied and bad credentials. Expected failures outside this list fall
through: client errors come back as `500 Internal server error`, as Spring's
default `{timestamp, status, error, path}` body, or as a raw library message
under an `error` key. Clients cannot tell what went wrong, and monitoring
counts client mistakes as server errors.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Any authenticated request (e.g. `GET /api/v1/cart`) with a valid token of a **deleted** user | `401 Invalid or expired token` | `500 {"message": "Internal server error"}` |
| 2 | `PUT /api/v1/users/{me}` with `email` equal to another user's email | `400 Email is already in use` | `500 {"message": "Internal server error"}` |
| 3 | Malformed JSON, empty body, `[]`, `null`, an array/object for a string field, or an int32 overflow (signup, signin, cart, POST/PUT products; malformed JSON and object/array string fields also verified for QR) | `400` in `ValidationErrorsDto` format | `400 {"timestamp", "status", "error": "Bad Request", "path"}` |
| 4 | `PUT`/`DELETE /api/v1/cart/items/abc`; `GET`/`PUT`/`DELETE /api/v1/products/abc` | `400` with a readable message | `400 {"error": "For input string: \"abc\""}` |
| 6 | `POST /api/v1/orders` with an object-valued address field; `PUT /api/v1/orders/{id}/status` with JSON `null` or an unknown enum | `400` in `ValidationErrorsDto` format | Spring default `{timestamp, status, error, path}` body |
| 5 | Password over 72 bytes (see [BUG-0004](BUG-0004-password-limit-ignores-bcrypt-72-bytes.md)) | Field error | `400 {"error": "password cannot be more than 72 bytes"}` |

Row 6 of [BUG-0001](BUG-0001-identity-fields-not-canonicalized.md) (password
reset `500`) is another consequence of this missing mapping. It is tracked
there because its root cause is the identity model.

## Root cause

- [`JwtTokenFilter`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/security/JwtTokenFilter.java#L45)
  maps every non-`CustomException` to `500`. A signed token for a deleted
  user makes [`getAuthentication`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/security/JwtTokenProvider.java#L92)
  throw `UsernameNotFoundException`.
- [`GlobalExceptionHandlerController`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/controller/exception/GlobalExceptionHandlerController.java)
  has no handler for `HttpMessageNotReadableException` (row 3) or
  `DataIntegrityViolationException` (row 2; `UserService.edit` saves without
  a uniqueness check).
- The [generic `IllegalArgumentException` handler](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/controller/exception/GlobalExceptionHandlerController.java#L61)
  returns any library message to the client (rows 4–5).

## Steps to reproduce

Row 1: register a user, log in, delete the user as admin, then call
`GET /api/v1/cart` with the user's token. Row 2: register two users, then as
the second user set `email` to the first user's exact email. Rows 3–5: send
the listed requests.

## Evidence

Rows 3–5 were verified on 2026-10-26 during exploration (cart and users).
Rows 1–2 were verified once each on 2026-10-26 after the code review. Test
accounts were deleted afterwards.

Products extension confirmed on 2026-10-26 against backend 3.9.4, profile
`local`, image revision `fd4c015434dd573f26bf8ff6691ff14611e2f247`. All malformed
root-body variants on POST/PUT and nonnumeric/fractional/overflow IDs on
GET/PUT/DELETE were exercised. A whitespace ID (`%20`) also returns the default
Spring body. Evidence: `artifacts/products-exploration-2026-10-26/evidence.jsonl`,
`body ...` and `path ...` labels. The same
[global handler](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/controller/exception/GlobalExceptionHandlerController.java#L44-L70)
applies to products. The distinct missing DTO length checks behind product
SQL failures are tracked in [BUG-0009](BUG-0009-product-field-lengths-exceed-storage-limits.md).

## Suggested fix

Map these failures to defined client errors:

- `UsernameNotFoundException` in the filter → `401`.
- Unreadable body → `400` in `ValidationErrorsDto` format.
- Duplicate email on edit → `400 Email is already in use` (check before
  saving).
- Path type mismatch → `400` with a parameter message.

Replace the catch-all `IllegalArgumentException` handler with specific
validation errors.

## Acceptance criteria

- Every symptom row returns the expected status and documented body.
- Unexpected server failures still return `500` without internal details.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).

QR malformed JSON and object/array `text` each returned the default `400` body once on 2026-10-27, backend image 3.9.4, image revision `fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`.

Orders extension verified on 2026-10-27 against backend 3.9.4, OCI revision
`fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`. An object-valued
`city` and literal JSON `null` status each returned the Spring default `400`
body once; the existing pending order remained unchanged after rejected status
input. The area agent also verified an unknown enum status. These share the
missing unreadable-body exception mapping, rather than a new root cause.
Source: [global handler](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/controller/exception/GlobalExceptionHandlerController.java#L44-L70).
Sanitized reproduction and limits: [increment evidence](../../../docs/api-coverage-increment-2026-10-27.md).

Duplicate-email profile edit (row 2) was reproduced again on 2026-10-27 using
two disposable accounts: 500 `{"message":"Internal server error"}`. Both
accounts were deleted with 204; runtime revision/profile as in the Orders
extension above. No known-failing regression was added to the current suite.
