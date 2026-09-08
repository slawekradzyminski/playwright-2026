# BUG-002: Product update accepts blank catalog fields

## Classification

- Type: Functional
- Status: Suspected
- Severity (proposed): Medium — proposed because blank stored fields can reduce catalog data quality; the intended update rule needs confirmation.

## Endpoint

`PUT /api/v1/products/{id}`

## Environment

- Observed on: 2026-09-07
- Base URL: `http://localhost:8081`
- Application version: Not recorded
- Contract source: `GET /v3/api-docs`; see [saved OpenAPI](../../docs/openapi.json)
- Identity: Admin

## Preconditions

Authenticate as admin. Create a disposable product using the setup payload below and retain its returned ID.

Setup payload (substitute a unique name):

```json
{"name":"Explore-<unique>","description":"Exploratory product","price":12.34,"stockQuantity":3,"category":"Tests","imageUrl":"https://example.test/a.png"}
```

## Reproduction

1. `POST /api/v1/products` with the setup payload; retain the ID.
2. `PUT /api/v1/products/{id}` with `{"name":"   "}`.
3. `GET /api/v1/products/{id}` to inspect persistence.
4. Independently repeat with a fresh product and `{"category":""}` to isolate the second field.

Use `Authorization: Bearer <ADMIN_TOKEN>` and `Content-Type: application/json` for writes. The historical transcript exercised both updates on the same product.

## Expected

Proposed: HTTP `400` and unchanged product, preserving the nonblank constraints enforced on creation. This is inferred from create behavior, not an explicit update requirement: `ProductUpdateDto` also omits the nonblank constraints. Confirm the intended rule.

## Actual

HTTP `200`; update responses contain `name: "   "` and later `category: ""`. The original report records that blank values were stored. Creation rejects the same values with `400`.

## Evidence

See [product transcript](../exploration/products.txt), entries `invalid create name`, `invalid update name`, `invalid create category`, and `invalid update category`. Separate GET responses for these blank updates were not retained.

## Impact

An administrator can store blank catalog fields through updates even though creation disallows them.

## Cleanup

The historical run deleted product 52; cleanup then returned `404`. The disposable user cleanup returned `204`.

## Follow-up and automation

Confirm the update requirements before deciding whether to change validation or explicitly document the difference. Preserve this finding even while the requirement is unresolved.

This report preserves historical observations; it was not freshly reproduced during the documentation update. Do not add automated coverage reproducing this open finding or mark it as an expected failure. After a fix, explore the corrected behavior before adding passing regression coverage.
