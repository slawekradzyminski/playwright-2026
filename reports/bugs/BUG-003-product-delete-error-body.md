# BUG-003: DELETE product 404 does not return documented ErrorDto

## Classification

- Type: Documentation/contract
- Status: Open
- Severity (proposed): Medium — proposed because clients expecting a documented JSON error may fail to parse the empty response.

## Endpoint

`DELETE /api/v1/products/{id}`

## Environment

- Observed on: 2026-09-07
- Base URL: `http://localhost:8081`
- Application version: Not recorded
- Contract source: `GET /v3/api-docs`; see [saved OpenAPI](../../docs/openapi.json)
- Identity: Admin

## Preconditions

Authenticate as admin. Create a disposable product using the setup payload below and retain its ID.

Setup payload (substitute a unique name):

```json
{"name":"Explore-<unique>","description":"Exploratory product","price":12.34,"stockQuantity":3,"category":"Tests","imageUrl":"https://example.test/a.png"}
```

## Reproduction

1. `POST /api/v1/products` with the setup payload and `Authorization: Bearer <ADMIN_TOKEN>`; retain its ID.
2. `DELETE /api/v1/products/{id}` with the admin token; expect `204`.
3. Repeat the same DELETE and inspect both status and raw body.

This sequence is the original report's reproduction recipe. The retained transcript separately demonstrates the missing-ID response using ID `9223372036854775807`.

## Expected

HTTP `404` with the documented `ErrorDto` body, for example `{"message":"Product not found"}`. GET and PUT missing-product responses provide that message. The contract source is the DELETE operation in [saved OpenAPI](../../docs/openapi.json).

## Actual

HTTP `404` with an empty body.

## Evidence

See [product transcript](../exploration/products.txt), entry `DELETE 9223372036854775807`. The repeated DELETE sequence itself was not retained as a separate transcript.

## Impact

Consumers relying on the documented error schema receive no JSON error detail.

## Cleanup

The historical exploration deleted its disposable product and user. In a new reproduction, verify that the created product remains deleted.

## Follow-up and automation

Decide whether the implementation must return ErrorDto or the contract must specify an empty error response. Classification identifies a confirmed mismatch, not which side must change.

This report preserves historical observations; it was not freshly reproduced during the documentation update. Do not add automated coverage reproducing this open finding or mark it as an expected failure. After a fix, explore the corrected behavior before adding passing regression coverage.
