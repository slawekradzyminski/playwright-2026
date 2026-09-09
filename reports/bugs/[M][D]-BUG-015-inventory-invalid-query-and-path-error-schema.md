# BUG-015: Inventory error statuses and schemas are missing or incorrect

## Severity rationale

The inventory contract omits or misrepresents validation, missing-item, stock-conflict and access-error responses across four operations. Integrations cannot model those supported branches correctly from it. Runtime rejection and stock protection were verified; no stock corruption or consumer outage was demonstrated.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium
- Endpoints: all four operations under `/api/v1/admin/inventory`.
- Environment: 2026-09-08, http://localhost:8081, backend image 3.7.16, OCI revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`; saved OpenAPI version 1.0.

## Reproduction and actual results

Use a valid administrator token and a newly created disposable product for authenticated probes.

| Request | Actual status/body |
| --- | --- |
| GET collection or detail with `lowStockThreshold=0` | 400 `{"error":"lowStockThreshold must be at least 1"}` |
| GET `/not-a-number/movements` | 400 `{"error":"For input string: \"not-a-number\""}` |
| POST `/{owned-product}/adjustments` with `{"delta":0,"reason":"invalid zero","requestId":"<valid UUID>"}` | 400 `{"deltaNonZero":"delta must not be zero"}` |
| GET detail/movements, or POST valid adjustment, for missing ID `9223372036854775807` | 404 `{"message":"Product not found"}` |
| Replay an adjustment request ID with a different delta | 409 `{"message":"requestId already used with different payload"}` |
| Adjust below zero stock with a new request ID | 409 `{"message":"Insufficient stock"}` |
| Any inventory route, no bearer / invalid bearer | 401 `{"message":"Unauthorized"}` / `{"message":"Invalid or expired token"}` |
| Any inventory route, customer bearer | 403 `{"message":"Access denied"}` |

All recorded responses use `application/json`. The contract omits 400/404/409 and describes 401/403 with successful inventory DTOs. No requirement says that all error bodies must use the same field name.

## Expected and impact

Document the supported error statuses and their actual schemas: field-error maps for validation, `error` for binding/threshold errors, and `message` for authentication, authorization and domain errors. The intended rejections are supported by DTO constraints, service guards, lower-level tests and current gateway exploration. Incorrect contract models can hide useful error details from consumers.

## Evidence and cleanup

Supervisor independently verified these responses in [sanitized request/response evidence](../exploration/2026-09-08-supervisor-inventory-evidence.json), R05 in [review report](../exploration/2026-09-08-supervisor-review.md). Each listed variant was exercised; all three created products and the customer were deleted with 204. Rejected adjustments left stock and movement counts unchanged.

## Follow-up and automation

Update the OpenAPI error definitions. Passing tests retain verified intended behavior and link this report. Malformed UUID returning 401 is a separate functional finding, [BUG-014]([M][F]-BUG-014-inventory-malformed-request-id-401.md).
