# BUG-0010: Product image URL validation checks only the scheme prefix

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Products] Prefix-only imageUrl regex accepts missing hosts and whitespace in hosts |
| Issue Type | Bug |
| Priority | Low (proposed) |
| Component/s | API / Products |
| Labels | api, products, validation, url |
| Environment | http://localhost:8081, backend 3.9.4, profile `local` |
| Backend revision | Running image label [`fd4c015`](https://github.com/slawekradzyminski/test-secure-backend/tree/fd4c015434dd573f26bf8ff6691ff14611e2f247); relevant DTOs identical at reviewed HEAD `3152f6c` |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

The image URL constraint says the field must be a valid URL or empty, but
accepts any text after `http://` or `https://`, including no host or an invalid
host. These unusable image locations are saved and returned to clients.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Admin POST with `"imageUrl":"https://"` | `400` imageUrl error | `201`, invalid value saved |
| 2 | Admin POST with `"imageUrl":"https://not a host"` | `400` imageUrl error | `201`, invalid value saved |
| 3 | Admin PUT with either value | `400` imageUrl error; previous value retained | `200`, subsequent GET returns the invalid value |

## Root cause

Both [`ProductCreateDto` line 44](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/product/ProductCreateDto.java#L44)
and [`ProductUpdateDto` line 39](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/product/ProductUpdateDto.java#L39)
use `^(https?://.*|)$`. `.*` imposes no host or URI-syntax constraint.
This is independent of the field-length issue in BUG-0009.

## Steps to reproduce

1. Sign in as the configured administrator.
2. POST otherwise valid product data with each value in rows 1–2.
3. PUT either value on an owned product and GET that product as a client.
4. Delete the owned products.

## Evidence

POST variants confirmed once each; PUT variants confirmed in the initial run
and confirmed persisted by GET in the focused run on 2026-10-26.
Evidence: `artifacts/products-exploration-2026-10-26/evidence.jsonl` labels
`POST imageUrl value-2`, `POST imageUrl value-3`, `PUT imageUrl value-2`,
`PUT imageUrl value-3`; `followup.jsonl` labels `read persisted validation gap`.
Empty URLs were accepted and FTP URLs rejected as expected. All owned products
were removed.

## Suggested fix

Use a shared HTTP/HTTPS URI validator that checks syntax and a nonempty valid
host. Preserve the documented empty/null behavior. Validation need not fetch
the remote image.

## Acceptance criteria

- All three symptom rows return a field-level `400`, without product mutation.
- A syntactically valid HTTP/HTTPS URL and the documented empty/null cases work.
- POST and PUT use the same validator.
- The fix includes an automated regression test for this scenario.
