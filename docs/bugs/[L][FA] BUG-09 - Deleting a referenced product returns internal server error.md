# [FA] BUG-09 — Deleting a referenced product returns internal server error

**Status:** Open

**Environment:** 2026-09-10, gateway `http://localhost:8081`, deployed image `slawekradzyminski/backend:3.7.16`. Disposable ROLE_CLIENT accounts without MFA and the configured administrator. Source revision and effective rate-limit configuration were not identified. Commerce operations in the live OpenAPI matched the retained [snapshot](../exploratory-testing/openapi-2026-09-10.json). Tokens are omitted; product/order IDs below are placeholders.

**Reproduction:** Create a disposable product and user, add the product to the cart and create an order. DELETE `/api/v1/products/P` as admin before deleting its owner returned 500 `{"message":"Internal server error"}`. Deleting the owner returned 204; retrying product deletion then returned 204. The failed exploratory product was removed in the follow-up session.

**Expected / proposed correction:** Preserve order history and reject a prohibited deletion with a clear conflict response, or implement the agreed product-retirement policy. Do not expose an internal server failure for an expected reference constraint. The product API currently declares 204/400/401/403/404, and does not explain this dependency.

**Retest / proposed regression:** Agree reference/retirement policy, create an order referencing a product, attempt deletion and assert the chosen controlled response and intact order history. Account deletion is suitable only for disposable test fixtures, not a recommended production workaround. The commerce fixture removes its disposable owners and dependent orders before products.

**Impact assessment:** Admin product removal fails with an opaque server error when orders reference it; ordinary unreferenced cleanup works.

**Severity:** Low. Demonstrated impact is limited to diagnostics or integration guidance; no broad outage or authorization bypass was shown.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Deleting a newly created product referenced by an order still returned 500 with Internal server error. Deleting the disposable order owner and then the product returned 204 for each. Retain Low on current evidence: the dependent-data restriction may be legitimate; the opaque server error is the confirmed defect.
