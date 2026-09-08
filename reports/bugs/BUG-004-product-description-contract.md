# BUG-004: Create product rejects documented empty description

## Classification

- Type: Documentation/contract
- Status: Open
- Severity (proposed): Medium — proposed because a request allowed by the schema is rejected.

## Endpoint

`POST /api/v1/products`

## Environment

- Observed on: 2026-09-07
- Base URL: `http://localhost:8081`
- Application version: Not recorded
- Contract source: `GET /v3/api-docs`; see [saved OpenAPI](../../docs/openapi.json)
- Identity: Admin

## Preconditions

Authenticate as admin. Use a unique product name satisfying the documented name limits.

## Reproduction

1. Send `POST /api/v1/products` with `Authorization: Bearer <ADMIN_TOKEN>`, `Content-Type: application/json`, and:

```json
{"name":"Explore-<unique>","description":"","price":0.01,"stockQuantity":0,"category":"Tests","imageUrl":""}
```

The original follow-up report used `name: "abc"`; use a unique name for future reproductions.

## Expected

HTTP `201` according to `ProductCreateDto`: description is present and its documented `minLength` is 0. See [saved OpenAPI](../../docs/openapi.json).

## Actual

HTTP `400`:

```json
{"description":"Product description is required"}
```

The exploration also found PUT accepts an empty description.

## Evidence

The original report records the exact boundary payload and response above. See also [product transcript](../exploration/products.txt), empty-description create/update entries, and [exploration summary](../exploration/README.md) for the follow-up confirmation. The full follow-up request transcript was not retained.

## Impact

Clients following the schema cannot create a product with a value the documentation permits; create and update behavior differ.

## Cleanup

The recorded create request was rejected. The historical exploration cleaned up its other disposable product and user. If a future reproduction unexpectedly creates a product, delete that product.

## Follow-up and automation

Confirm whether an empty description is intended to be valid, then align the implementation and schema. Do not assume documentation alone is at fault.

This report preserves historical observations; it was not freshly reproduced during the documentation update. Do not add automated coverage reproducing this open finding or mark it as an expected failure. After a fix, explore the corrected behavior before adding passing regression coverage.
