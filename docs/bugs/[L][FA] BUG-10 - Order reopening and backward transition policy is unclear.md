# [FA] BUG-10 — Order reopening and backward transition policy is unclear

**Status:** Needs clarification

**Environment:** 2026-09-10, gateway `http://localhost:8081`, deployed image `slawekradzyminski/backend:3.7.16`. Disposable ROLE_CLIENT accounts without MFA and the configured administrator. Source revision and effective rate-limit configuration were not identified. Commerce operations in the live OpenAPI matched the retained [snapshot](../exploratory-testing/openapi-2026-09-10.json). Tokens are omitted; product/order IDs below are placeholders.

**Reproduction and evidence:** For a product initially holding 5 units, create an order for 2: stock becomes 3. Set CANCELLED as admin: stock becomes 5. Set PAID on that cancelled order: 200 with status PAID, stock remains 5. Reproduced on independent fixtures. A subsequent cancellation succeeded but stock stayed 5, so double-restocking was not demonstrated. Separately DELIVERED → PAID and DELIVERED → PENDING returned 200.

**Oracle ambiguity:** The status operation says it “validates unsupported transitions” but provides no transition matrix or reopening/reservation rule. Cancellation after SHIPPED/DELIVERED is rejected, while other backward transitions are accepted. Do not infer a full state machine from the enum alone.

**Required decision:** Define supported transitions and whether reopening must reacquire stock. Pending that decision this is not a confirmed violation of a defined transition matrix. Automated coverage checks the forward payment/shipping/delivery path, admin-only access, cancellation stock restoration and rejection of cancellation after delivery.

**Retest / proposed regression:** Once agreed, assert each disputed transition either fails without mutation or reopens with the required stock reservation. Overselling and concurrency consequences have not been demonstrated.

**Impact assessment:** Admin can reopen cancelled orders without reserving stock again; intended workflow and downstream impact need clarification.

**Severity:** Low (provisional). The expected transition policy is unresolved.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

A fresh order consumed 2 of 5 units; CANCELLED restored stock to 5, then PAID succeeded while stock remained 5. Reopening semantics are still undefined. Retain Needs clarification and provisional Low. This session did not demonstrate overselling, double-restocking, or the full backward-transition matrix.
