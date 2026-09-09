# BUG-010: Auth lifecycle and orders errors use success schemas in OpenAPI

## Severity rationale

Authentication lifecycle and order errors are declared as successful token/user/order DTOs. The contract therefore gives integrations incorrect models for authentication and order recovery. Correct runtime rejection is preserved, and no consumer outage is demonstrated; the material impact is the incompatible error interface, not a proven authentication bypass.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium
- Endpoints: POST users/refresh (400/401), GET users/me (401), all six orders operations (documented error responses).
- Environment: 2026-09-08, http://localhost:8081, backend 3.7.16 / 1e40f8a8e75538a747befbf9e36b4cd9d44a6848; saved/live OpenAPI 1.0 exactly match. Disposable customers and anonymous callers.

## Reproduction / expected / actual

POST `/api/v1/users/refresh` with JSON `{"refreshToken":"does-not-exist"}` returns 401 application/json `{"message":"Invalid refresh token"}`. Blank refresh returns 400 field-validation map. Anonymous GET `/api/v1/users/me` returns 401 application/json `{"message":"Unauthorized"}`. Neither is the documented TokenRefreshResponseDto/UserResponseDto. Order errors are likewise declared as OrderDto/PageDtoOrderDto; runtime probes pending.

Expected: preserve intended error rejection, document validation/error schemas, not successful entity/token schemas. Contract source: `docs/openapi.json` response content schema references.

## Evidence / impact

B02/B03/B05 in [sanitized evidence](../api/evidence/auth-orders-2026-09-08.jsonl), reproduced 2026-09-08. Consumers cannot reliably generate error models. This is a documentation issue; observed rejection matches validation/auth requirements.

## Cleanup / automation

Both disposable auth customers deleted (204). Keep passing error tests with comments referencing this report. Update order evidence after exploration. No production code or contract changed in this task.

Order runtime confirmed: C02 invalid address returns 400 `{"street":"Street is required"}`; empty cart 400 `{"message":"Cart is empty"}`; C03 malformed ID 400 `{"error":"For input string: \"bad-id\""}` and missing/foreign 404 `{"message":"Order not found"}`; C04/C05 invalid query enum 400 error map; C06/C07 transition rejection 400 message, anonymous 401 message, forbidden 403 message. All application/json. These intended errors are eligible for automation. Owned order cleanup completed (204 users, 404 orders, 204 products).
