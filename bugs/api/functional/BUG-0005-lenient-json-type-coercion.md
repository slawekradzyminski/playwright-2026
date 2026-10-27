# BUG-0005: JSON values of the wrong type are silently converted instead of rejected

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API] Default Jackson coercion turns 1.5 into 1 and true into "true" for typed DTO fields |
| Issue Type | Bug |
| Priority | Low (proposed) |
| Component/s | API (global), API / Cart, API / Users, API / Products |
| Labels | api, validation, cart, registration |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

The API uses Jackson's default coercion rules. Request values of the wrong JSON
type are converted to the declared type before validation runs. Client bugs go
unnoticed, and the stored data differs from what was sent: a quantity of `1.5`
becomes `1`, and a first name of `true` becomes the string `"true"`.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | `POST /api/v1/cart/items` `{"productId": 1, "quantity": 1.5}` | `400 {"quantity": ...}` | `200`, quantity `1` |
| 2 | `PUT /api/v1/cart/items/1` `{"quantity": 2.7}` | `400` | `200`, quantity `2` |
| 3 | Signup with `"username": 12345678`, `"password": 12345678` or `"firstName": true` | `400` field error | `201` |
| 4 | Admin POST/PUT product with `"stockQuantity":1.9` | `400` stockQuantity error | `201` / `200`, stored stock is 1 |
| 5 | Admin POST/PUT product with numeric/boolean name, description or category (e.g. `"name":true`) | `400` field error | `201` / `200`, value becomes text (e.g. `"true"`) |
| 6 | Admin PUT product with `"price":""` or `"stockQuantity":" "` | `400` field error | `200`, coerced to null and silently ignored |
| 7 | Admin POST/PUT product with `"price":"12.34"` or `"stockQuantity":"10"` | `400` for a JSON type inconsistent with the schema | `201` / `200`, converted to numbers |
| 9 | Client PUT profile with numeric firstName or lastName `1234` | 400 for non-string name | 200; GET me returns the string `"1234"` |

## Root cause

No coercion settings are configured for the application's JSON mapper (no
`DeserializationFeature`/coercion configuration in `src/main`). Jackson
therefore accepts floats for `Integer` fields (truncating them) and scalars
for `String` fields. Arrays and objects are rejected, but with an undocumented
body ([BUG-0006](BUG-0006-unmapped-exceptions-500-and-default-errors.md)).

## Steps to reproduce

Authenticated client for rows 1–2 (product `1` in the cart for row 2); no
Authorization header and otherwise valid, unique data for row 3.

## Evidence

Each row verified once on 2026-10-26 against the local API. Test accounts were
deleted afterwards.

Product rows 4–7 were confirmed on 2026-10-26 against image revision
`fd4c015434dd573f26bf8ff6691ff14611e2f247`, backend 3.9.4, profile `local`.
Evidence: `artifacts/products-exploration-2026-10-26/evidence.jsonl`, labels
`POST stockQuantity value-4`, `PUT stockQuantity value-4`, string-field scalar
variants, and numeric-string variants. PUT read-backs confirm stored/coerced
values; owned resources were deleted. Product DTO types are declared in
[`ProductCreateDto` lines 19–42](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/product/ProductCreateDto.java#L19-L42)
and [`ProductUpdateDto` lines 19–37](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/product/ProductUpdateDto.java#L19-L37).

## Suggested fix

Disable float-to-int and scalar-to-string coercion globally
(`ACCEPT_FLOAT_AS_INT`, `ALLOW_COERCION_OF_SCALARS` / coercion configs), and
map the resulting errors to field messages.

## Acceptance criteria

- All listed symptom rows return `400` with an error for the offending field, and nothing is
  stored.
- Correctly typed requests are unaffected.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).

QR row 8 was verified once per value on 2026-10-27 against backend image 3.9.4, image revision `fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`. The [QR DTO](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/qr/CreateQrDto.java#L14-L17) declares a string. PNGs were decoded with ZXing.

Profile numeric-name coercion verified once per field on 2026-10-27 at backend
3.9.4, revision `fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`.
[UserEditDto](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/user/UserEditDto.java#L29-L35)
declares String fields; GET me confirmed stored text. Both owned accounts were
deleted (204). Evidence: `artifacts/api-increment-2026-10-27/supervisor-boundary-evidence.json`.
