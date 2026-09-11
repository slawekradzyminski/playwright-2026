# [FA] BUG-08 — Invalid order status returns unauthorized

**Status:** Open

**Environment:** 2026-09-10, gateway `http://localhost:8081`, deployed image `slawekradzyminski/backend:3.7.16`. Disposable ROLE_CLIENT accounts without MFA and the configured administrator. Source revision and effective rate-limit configuration were not identified. Commerce operations in the live OpenAPI matched the retained [snapshot](../exploratory-testing/openapi-2026-09-10.json). Tokens are omitted; product/order IDs below are placeholders.

**Reproduction:** Given an existing disposable order and a valid admin token, PUT `/api/v1/orders/O/status` with Content-Type application/json and the JSON string `"INVALID"`. Observed 401 `{"message":"Unauthorized"}` in three independent sessions. The same token successfully sets `"SHIPPED"` immediately beforehand and deletes the disposable accounts afterward.

**Expected:** Reject the invalid enum as a request validation/parsing error (400), preserving the order and authentication state. The request contract permits only PENDING, PAID, SHIPPED, DELIVERED and CANCELLED. A valid admin credential is not the cause of this failure.

**Retest / proposed regression:** Send an invalid enum as admin, assert 400 and unchanged stored status, then perform an allowed transition with the same token. Do not encode 401 as correct behavior in the active suite. This resembles BUG-01/05 parsing misclassification; shared root cause is unverified.

**Impact assessment:** A valid administrator gets misleading authentication guidance for invalid input; valid status changes remain usable.

**Severity:** Low. Demonstrated impact is limited to diagnostics or integration guidance; no broad outage or authorization bypass was shown.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

A valid administrator updating a newly created order to INVALID still received 401 with Unauthorized. Valid transitions remain usable. Retain Low for incorrect corrective guidance, not a security compromise.
