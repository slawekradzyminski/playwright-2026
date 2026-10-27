# BUG-0009: Product DTO length constraints do not match database columns

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Products] Category and imageUrl exceed varchar(255) without validation, causing 500 on create/update |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / Products |
| Labels | api, products, validation, persistence |
| Environment | http://localhost:8081, backend 3.9.4, profile `local` |
| Backend revision | Running image label [`fd4c015`](https://github.com/slawekradzyminski/test-secure-backend/tree/fd4c015434dd573f26bf8ff6691ff14611e2f247); relevant product code identical at reviewed HEAD `3152f6c` |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

Create/update DTOs place no length limit on category or imageUrl, but both
persist into varchar(255) columns. An otherwise valid request with 256 characters
passes validation and fails at flush with `500`. The API cannot safely accept
all values allowed by its published schema.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Admin POST `/api/v1/products`, category = 256 `a` characters | `400` category error, or successful persistence if storage is deliberately enlarged | `500 {"message":"Internal server error"}` |
| 2 | Admin PUT `/api/v1/products/{id}`, same category | Defined client validation error without mutation | Same `500`; original product survives unchanged |
| 3 | Admin POST, imageUrl = `https://example.com/` + 236 `a` characters (256 total) | Defined imageUrl validation error, or successful persistence with compatible storage | Same `500` |
| 4 | Admin PUT, same imageUrl | Defined client validation error without mutation | Same `500`; original product survives unchanged |

## Root cause

- [`ProductCreateDto` lines 40–46](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/product/ProductCreateDto.java#L40-L46)
  and [`ProductUpdateDto` lines 36–41](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/product/ProductUpdateDto.java#L36-L41)
  omit `@Size` for both fields.
- [`ProductEntity` lines 54–57](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/entity/ProductEntity.java#L54-L57)
  use default string column lengths. Runtime H2 logs explicitly confirm
  `CATEGORY CHARACTER VARYING(255)` and `IMAGE_URL CHARACTER VARYING(255)`.
- The exception is not converted to a defined validation response. The primary
  repair is to align the field validation/storage contract rather than mask
  every integrity error as a bad request.

## Steps to reproduce

1. Sign in as the configured administrator. Use a generated, owned test product.
2. POST a valid body such as `{"name":"Length probe","description":"Test",
   "price":12.34,"stockQuantity":10,"category":"Test","imageUrl":""}`,
   replacing the field with the value from rows 1 or 3.
3. For rows 2 and 4, create a valid product first, then PUT only the listed field.
4. Compare 255-character and 256-character values; GET after failed PUT.

## Evidence

All four rows confirmed once in the initial run. A 257-character imageUrl also
fails on POST/PUT. Both fields succeed at 255 characters. Category overflow
confirmed again on POST/PUT during the focused run. A failed combined update of
category, price and stock rolled back the entire product change and inventory
movement. Failed POST did not add a product to the catalogue.

Sanitized local evidence: `artifacts/products-exploration-2026-10-26/evidence.jsonl`
and `followup.jsonl`; labels `POST category value-3`, `PUT category value-3`,
`POST imageUrl value-6`, `PUT imageUrl value-6`, `combined invalid update`.
Runtime logs include `Value too long for column` for both columns.
All owned resources were removed after exploration.

## Suggested fix

Choose supported field lengths, enforce them in both DTOs, explicitly align
column definitions/migrations and publish the same OpenAPI maximum lengths.
If the limit stays 255, use nullable `@Size(max = 255)` on update fields so null
continues to mean unchanged.

## Acceptance criteria

- POST/PUT honor the same documented category and imageUrl length limits.
- Supported boundary values persist; unsupported values return field-level
  `400` errors rather than `500`.
- Invalid requests leave products and inventory history unchanged.
- The fix includes automated regression tests for both fields and methods.
