# [D] DOC-11 — Commerce errors omit stock conflicts and use success schemas

**Status:** Open

**Environment:** 2026-09-10, gateway `http://localhost:8081`, deployed image `slawekradzyminski/backend:3.7.16`. Disposable ROLE_CLIENT accounts without MFA and the configured administrator. Source revision and effective rate-limit configuration were not identified. Commerce operations in the live OpenAPI matched the retained [snapshot](../../exploratory-testing/openapi-2026-09-10.json). Tokens are omitted; product/order IDs below are placeholders.

**Reproduction and evidence:** Create a product with stock 5. As its cart owner, POST `/api/v1/cart/items` with `{"productId":P,"quantity":6}`; repeat with a cart containing 2 and POST quantity 4. PUT `/api/v1/cart/items/P` quantity 6 also fails. Both return 409 `{"message":"Insufficient stock for product P"}`. For checkout, add quantity 2 while stock is 5, lower stock to 1 as admin, then POST `/api/v1/orders` with a valid address: the same 409 occurs and the cart retains quantity 2. Reproduced in follow-up passes.

**Contract discrepancy:** All three operations omit 409. Cart GET/POST/PUT/DELETE-item responses use CartDto for 401 and applicable 400 responses; observed bodies are `{"message":"Unauthorized"}` and field errors such as `{"quantity":"Quantity cannot be negative"}`. Orders use OrderDto or PageDtoOrderDto for errors, although empty-cart checkout returns `{"message":"Cart is empty"}`, own-list negative page returns `{"error":"Page index must not be less than zero"}`, and admin list/status requests as a client return `{"message":"Access denied"}`. Existing ErrorDto cart-item 404 declarations are correct and should remain.

**Expected / correction:** Document 409 and its message schema on the three stock-sensitive operations. Describe authentication, authorization, validation and not-found error bodies with error schemas, not success DTOs.

**Retest / automation:** Validate the corrected response declarations against recorded branches. Runtime 409 and representative error cases are covered by the new specs; this does not close the documentation defect.

**Impact assessment:** Error consumers lack documented stock-conflict handling and receive misleading models; no consumer outage demonstrated.

## Severity rationale and decision

Stock-conflict branches and commerce error models are incomplete, requiring explicit client error handling outside the generated contract. Runtime stock protection works and failed checkout retains the cart. No lost stock, bypass or supported-consumer outage was demonstrated by the documentation gap.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Adding 6 units of a stock-5 product returned 409 with an insufficient-stock message. The live commerce response declarations remain unchanged. Runtime stock protection is appropriate; missing/conflicting error documentation is the defect. 
