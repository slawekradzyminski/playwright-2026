# BUG-011: Invalid status JSON returns 401 for an authenticated admin

- Type: Functional
- Status: Open
- Severity (proposed): Medium — malformed input looks like session expiry and prevents clients from distinguishing validation from authentication.
- Endpoint: `PUT /api/v1/orders/{id}/status`
- Environment: 2026-09-08 08:53 UTC, http://localhost:8081, backend 3.7.16 revision 1e40f8a8e75538a747befbf9e36b4cd9d44a6848, saved/live OpenAPI 1.0.

## Reproduction

Create disposable order, then PUT `/api/v1/orders/7/status`, Content-Type application/json, Authorization `Bearer <ADMIN_TOKEN>`, body `"BOGUS"`. The same token successfully updates an order to `"PAID"` immediately afterward.

## Expected / actual

Expected 400 for invalid enum input, per status request enum and documented 400, with no state change. Actual 401 application/json;charset=UTF-8 `{"message":"Unauthorized"}`. Token remained valid. C07-invalid records two reproductions in [evidence](../api/evidence/auth-orders-2026-09-08.jsonl). The second independent disposable-order terminal run reproduced the same result.

## Cleanup / follow-up / automation

Disposable users deleted 204, orders verified removed, products deleted 204. Investigate exception/error-dispatch mapping for deserialization errors. Exclude invalid enum body from passing automation; retain supported 400 for DELIVERED → CANCELLED. Add a backend HTTP test asserting 400 for malformed enum JSON with a valid admin token.
