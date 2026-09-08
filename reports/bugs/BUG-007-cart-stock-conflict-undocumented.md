# BUG-007: Cart stock conflicts return undocumented 409 responses

## Classification
- Type: Documentation/contract
- Status: Open
- Severity (proposed): Medium — clients cannot derive stock-error handling from the published contract.

## Endpoint
POST `/api/v1/cart/items`; PUT `/api/v1/cart/items/{productId}`.

## Environment
- Observed: 2026-09-08, terminal exploration E11.
- Gateway: `http://localhost:8081`.
- Image: backend 3.7.16, revision label `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`.
- Contracts: saved `docs/openapi.json` and live `/v3/api-docs` match for cart operations.
- Identity: disposable customer A.

## Preconditions
Create owned product with stockQuantity 20, price 12.34; add quantity 2 to customer A's cart. Product ID in evidence: 684. Customer B owns quantity 1 of the same product.

## Reproduction
1. POST `/api/v1/cart/items`, `Authorization: Bearer <CUSTOMER_A_TOKEN>`, `Content-Type: application/json`, `{"productId":684,"quantity":21}` (substitute the newly created ID).
2. GET `/api/v1/cart` as A.
3. PUT `/api/v1/cart/items/684`, same headers, `{"quantity":21}`.
4. GET `/api/v1/cart` as A and B.

## Expected
Published operations list only 200/400/401/404. The stock-conflict response and error schema should be documented. Rejection without mutation was a source-derived hypothesis, not an explicit saved-contract stock requirement.

## Actual
Both mutations returned `409 application/json`, `{"message":"Insufficient stock for product 684"}`. A retained quantity 2 and total 24.68; B retained quantity 1 and total 12.34. No functional rollback defect observed.

## Evidence
[Terminal evidence](../exploration/2026-09-08-cart-evidence.md), E11 excessive add/update and follow-up reads. One request per operation.

## Impact
Generated clients lack the stock-conflict outcome and its response model.

## Cleanup
Both disposable carts cleared (204), products 684/685 deleted (204), both customers deleted (204).

## Follow-up and automation
Document 409 and ErrorDto. Under the clarified policy, the documentation issue does not block tests of intended stock rejection. Fresh terminal probes N409 confirmed rejection and unchanged carts; both POST and PUT now have passing 409 regression tests with comments referencing this report. Recommend a backend real-database rollback test for both mutations.
