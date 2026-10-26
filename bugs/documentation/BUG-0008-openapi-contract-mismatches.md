# BUG-0008: OpenAPI contract does not match behavior for users and cart endpoints

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Docs] /v3/api-docs misstates limits, required fields, error bodies and pricing for users and cart |
| Issue Type | Bug |
| Priority | Low (proposed) |
| Component/s | API / Documentation |
| Labels | api, documentation, contract |
| Environment | Local stack http://localhost:8081/v3/api-docs, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

The published contract is the reference for clients and for our test suite.
In the places below it describes behavior the API does not have. Each item
should be fixed together with the linked functional bug, or by itself if that
bug's behavior is accepted as intended.

## Symptoms

| # | Contract location | Contract says | Actual behavior | Related |
| --- | --- | --- | --- | --- |
| 1 | `UserRegisterDto.password` | `maxLength: 255` | Limit is 72 UTF-8 bytes | [BUG-0004](../functional/BUG-0004-password-limit-ignores-bcrypt-72-bytes.md) |
| 2 | `ResetPasswordRequestDto.newPassword` | No maximum | Limit is 72 UTF-8 bytes | [BUG-0004](../functional/BUG-0004-password-limit-ignores-bcrypt-72-bytes.md) |
| 3 | `LoginDto` | No `required` fields | Missing fields → `422`; empty strings → `400` | [BUG-0003](../functional/BUG-0003-request-validation-gaps.md) |
| 4 | `400` responses of signup, signin and cart items | `ValidationErrorsDto` (field keys, `error` key for invalid arguments) | Unreadable bodies return Spring's `{timestamp, status, error, path}` | [BUG-0006](../functional/BUG-0006-unmapped-exceptions-500-and-default-errors.md) |
| 5 | `GET /api/v1/cart` description | "calculated total price" | Total uses per-line price snapshots, not current prices | [BUG-0002](../functional/BUG-0002-cart-and-order-use-stale-price.md) |
| 6 | `200` responses of cart endpoints and signin | Media type `*/*` | `Content-Type: application/json` | — |
| 7 | `PUT /api/v1/users/{username}` `404` | "The user doesn't exist" (implied: for anyone) | Returned to non-admins before authorization | [BUG-0007](../functional/BUG-0007-username-enumeration-via-preauthorize.md) |
| 8 | Error responses of authenticated endpoints | No `500` documented | `500` for a deleted user's token and duplicate email on edit | [BUG-0006](../functional/BUG-0006-unmapped-exceptions-500-and-default-errors.md) |

## Root cause

The schemas are generated from DTO annotations and `@ApiResponse`
declarations that do not reflect runtime constraints: BCrypt's byte limit,
missing `@NotNull`, and error paths outside `GlobalExceptionHandlerController`.
Response media types are left at springdoc's default `*/*` where no
`produces` is declared.

## Steps to reproduce

1. `curl -s http://localhost:8081/v3/api-docs` and inspect the locations in
   the table.
2. Trigger the actual behavior as described in the related reports.

## Evidence

The contract was read on 2026-10-26. The actual behavior for each row was
verified at runtime on 2026-10-26 (see the related reports). Row 6 is visible
in any successful cart or signin response header.

## Acceptance criteria

- Each row's contract matches runtime behavior after the related functional
  fix (or after the current behavior is accepted as intended).
- `/v3/api-docs` passes a contract check against the automated API suite.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).
