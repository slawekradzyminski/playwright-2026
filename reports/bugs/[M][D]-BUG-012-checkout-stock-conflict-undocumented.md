# BUG-012: Checkout stock conflict returns undocumented 409

## Severity rationale

Checkout correctly rejects insufficient stock with 409 and preserves cart, stock and order state, but the contract omits this expected checkout recovery branch. Integrations need explicit handling to guide quantity correction. This impairs the declared purchase interface without demonstrating lost orders, stock or payment.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium
- Endpoint: `POST /api/v1/orders`
- Environment: 2026-09-08 08:53 UTC, http://localhost:8081, backend 3.7.16 revision 1e40f8a8e75538a747befbf9e36b4cd9d44a6848, matching saved/live OpenAPI 1.0.

## Reproduction / expected / actual

Customer A adds owned products 920/921 with quantities 2/3. Admin reduces product 921 stock to 1 using PUT products/921 `{"stockQuantity":1}`. POST orders with valid address (Test Street, Warsaw, Mazovia, 00-001, PL), Authorization `Bearer <CUSTOMER_A_TOKEN>`.

Actual: 409 application/json `{"message":"Insufficient stock for product 921"}`. Cart remains two lines, total 41.69/5 items, stock unchanged and no new order. Expected: preserve this correct stock protection and document 409 with an error schema; current contract only lists 201/400/401. Requirement: checkout must not consume unavailable stock; relates to BUG-007 for cart conflicts.

## Evidence / cleanup / automation

C02-before/stock-conflict/after/orders in [evidence](../api/evidence/auth-orders-2026-09-08.jsonl), one reproduction. Users deleted 204, orders 404, products 204. Retain a passing 409 rollback test with this bug reference. No infrastructure fault injection or shared product changes used.
