# BUG-013: Order mutation response updatedAt differs from persisted readback

## Severity rationale

Mutation and readback timestamps differ by milliseconds while business fields and separately verified stock effects agree. The record demonstrates a metadata discrepancy, not lost updates or incorrect order state. A readback supplies persisted metadata; intended timestamp precision/flush semantics remain unresolved.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Functional
- Category: functional
- Tags: functional, api
- Status: Suspected
- Severity (proposed): Low
- Endpoints: POST `/api/v1/orders/{id}/cancel`, PUT `/api/v1/orders/{id}/status`
- Environment: 2026-09-08 09:00 UTC, http://localhost:8081, backend 3.7.16 / 1e40f8a8e75538a747befbf9e36b4cd9d44a6848, matching saved/live contract 1.0.

## Reproduction / expected

Create owned order, then cancel with customer token or update status with admin token. Immediately GET as owner. Hypothesis: mutation response updatedAt should describe the persisted modification, consistent with the OrderDto last-update timestamp description. Timestamp precision/flush timing policy needs confirmation.

## Actual / evidence

Initial affected Playwright run: five failures only in exact timestamp equality, 37 passes. Example cancellation response updatedAt `2026-09-08T09:00:39.922328`, owner GET `2026-09-08T09:00:39.9357`. PAID status response `2026-09-08T09:00:49.945781`, GET `2026-09-08T09:00:49.953621`. Source OrderService converts saved entity into DTO before transaction flush; timestamps update during flush. Terminal C07-forward/C07-readback also contain the discrepancy in [evidence](../api/evidence/auth-orders-2026-09-08.jsonl). Business fields match and stock effects are verified separately.

## Cleanup / follow-up / automation

All test fixture cleanup passed. Confirm intended timestamp semantics; if stale metadata is unintended, flush before DTO mapping and add backend mutation/readback timestamp assertion. Passing tests keep business-field persistence and timestamp parseability checks but exclude mutation/readback updatedAt equality with a bug-reference comment. No expected failures or skipped tests.
