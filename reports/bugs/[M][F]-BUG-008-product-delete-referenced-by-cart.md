# BUG-008: Deleting a product referenced by a customer cart returns 500

## Severity rationale

An ordinary customer cart causes administrator product deletion to return 500, so retirement of that product cannot complete while the reference exists. Clearing the owned cart enabled deletion in the reproduction, but that is not necessarily an acceptable workaround for other customers' carts. Impact is a conditional admin operation; no wider outage or corrupt state was observed.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification
- Type: Functional
- Category: functional
- Tags: functional, api
- Status: Open
- Severity (proposed): Medium

## Endpoint
DELETE `/api/v1/products/{id}`.

## Environment
- Observed: 2026-09-08T07:56Z.
- Gateway: `http://localhost:8081`.
- Backend image: 3.7.16, revision label `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`.
- Contract: `docs/openapi.json`, product DELETE operation.
- Identities: admin and disposable customer; credentials omitted.

## Preconditions
Admin and customer bearer tokens. An owned disposable product with positive stock. No orders are created by this reproduction.

## Reproduction
1. POST `/api/v1/products` with `Authorization: Bearer <admin-token>`, `Content-Type: application/json`, and payload:
   ```json
   {"name":"Cart deletion reproduction <unique-suffix>","description":"Disposable cart exploration","price":12.34,"stockQuantity":20,"category":"Testing","imageUrl":"https://example.test/cart.png"}
   ```
   Response: 201. Capture the returned product ID (773 in this run).
2. POST `/api/v1/cart/items` with `Authorization: Bearer <customer-token>`, `Content-Type: application/json`, and `{"productId":773,"quantity":1}` (substitute the captured ID). Response: 200.
3. DELETE `/api/v1/products/773` with `Authorization: Bearer <admin-token>`.
4. GET `/api/v1/products/773` as admin and GET `/api/v1/cart` as the customer to verify state.

Credential values are represented by `<admin-token>` and `<customer-token>`; the exact sanitized cart setup is in [cart exploration evidence](../exploration/2026-09-08-cart-evidence.md), P01.

## Expected
The product DELETE contract documents 204 success and does not specify a restriction for products in carts. It should not fail with an unhandled 500. Whether to remove cart references or reject deletion with an explicit documented conflict is a product-policy decision; no cascade requirement is assumed.

## Actual
DELETE returned `500 application/json;charset=UTF-8`, `{"message":"Internal server error"}`. Product GET remained 200. Cart GET retained `{"productId":773,"quantity":1}`, totalItems 1, totalPrice 12.34. After clearing the customer's cart, deleting the same product returned 204.

## Evidence
[Terminal evidence](../exploration/2026-09-08-cart-evidence.md), P01 add/delete/follow-up reads and cleanup. One reproduction with the cart reference present; successful control deletion after removing it. Source ProductService.deleteProduct directly calls repository.delete; a database reference constraint is a hypothesis, not a confirmed root cause from logs.

## Impact
Admins cannot delete products currently referenced by carts. The generic server error does not explain the restriction or offer a supported recovery action.

## Cleanup
Both disposable carts cleared (204), owned products 773/774 deleted (204), both disposable customers deleted (204). No leftovers.

## Follow-up and automation
Confirm intended product/cart lifecycle policy, implement deletion or an explicit conflict response, and re-explore before regression automation. Keep this open bug out of passing API tests. Add a real-database backend product-deletion test with an existing cart reference once policy is defined.

The original cart exploration did not cover deleting referenced products: its teardown cleared carts first. The user-supplied reproduction identified this missing dependency check. The evidence path originally supplied (`../exploration/evidence/2026-09-08-cart.md`) does not exist in this workspace; the link above is the actual evidence file.
