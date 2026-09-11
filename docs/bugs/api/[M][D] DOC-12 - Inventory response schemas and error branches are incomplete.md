# [D] Inventory endpoints — success values and errors contradict the response contract

**ID:** DOC-12
**Status:** Open

## Environment and reproducible evidence

Observed before automation and rechecked independently on 2026-09-10 through `http://localhost:8081`, backend `slawekradzyminski/backend:3.7.16`. The live contract matches the retained [snapshot](../../exploratory-testing/openapi-2026-09-10.json); deployed source revision is unverified. Use an administrator and a disposable product with stock 5; delete the product after the session and assert 204.

- POST `/api/v1/admin/inventory/{productId}/adjustments` with `delta: -5`, a short reason and a fresh UUID requestId returns 201 with `orderId: null` and an offset-free createdAt. InventoryMovementDto declares orderId as integer and createdAt as date-time. The initial movement has requestId null while the schema declares a UUID string.
- GET inventory list/detail returns lastChangedAt without an offset, whereas InventoryItemDto declares date-time. For example, the reviewed response used `2026-09-10T13:48:13.770426`.
- The four operations document 401/403 using their success DTOs. Actual authentication/permission failures are JSON message objects.
- Invalid threshold 0 returns 400 with `{"error":"lowStockThreshold must be at least 1"}` on list/detail; that branch is omitted.
- A nonexistent product returns 404 with `{"message":"Product not found"}` for detail, movements and adjustment; those branches are omitted.
- After stock reaches zero, delta -1 returns 409 with `{"message":"Insufficient stock"}`. Reusing requestId with a different delta returns 409 with `{"message":"requestId already used with different payload"}`. Neither 409 branch is documented. Repeating the same payload returns the original 201 movement without another stock change.

## Impact assessment

Normal successful responses cannot conform to the declared nullability/date-time types, and consumers lack accurate error models and conflict branches. A strict contract consumer must override the generated model; no deployed consumer outage was observed. Runtime underflow protection and idempotency are appropriate and are covered by passing tests. An undocumented 409 is not itself a functional bug.

## Severity rationale and decision

Routine inventory success values contradict declared nullability and timestamp types, requiring strict consumers to override the contract. This directly impairs success-response compatibility; the grouped error omissions do not increase that impact. Stock underflow protection and idempotency worked, and no deployed consumer outage was observed.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Expected correction and retest

Align nullable fields with actual supported states; agree offset/timezone semantics and correct either response serialization or the declared format. Describe 400/404/409 bodies and idempotency semantics, and use error models for 401/403. Retest all four operations against the corrected contract. The active suite asserts stock/movement invariants and representative errors without approving offset omission as a requirement.
