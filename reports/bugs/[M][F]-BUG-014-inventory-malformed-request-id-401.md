# BUG-014: Inventory adjustment with malformed requestId returns 401

## Severity rationale

A malformed inventory requestId returns an authentication error for a valid administrator without recording an adjustment. The response hides the input-repair category and can misdirect API recovery; token expiry or a retry loop was not demonstrated. Correcting the UUID is a recovery path, and the precise public error mapping remains under triage.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: functional
- Tags: functional, api
- Status: Suspected
- Severity (proposed): Medium

## Endpoint

`POST /api/v1/admin/inventory/{productId}/adjustments`

## Environment

- Observed on: 2026-09-08
- Base URL: configured local gateway (value omitted)
- Application version: container image `3.7.16`, OCI revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`
- Contract source/version: `docs/openapi.json`, operation `POST /api/v1/admin/inventory/{productId}/adjustments`
- Identity: authenticated administrator; token omitted

## Preconditions

Disposable product `1567` existed. No inventory mutation was expected from the invalid request.

## Reproduction

1. Send `POST /api/v1/admin/inventory/1567/adjustments` with `Authorization: Bearer <admin-token>`, `Content-Type: application/json`, and `{"delta":1,"reason":"valid","requestId":"bad"}`.
2. Read inventory detail/movements for product `1567` to confirm no adjustment was recorded.

## Expected

The request DTO declares `requestId` as a UUID and is annotated for validation. A malformed UUID should be rejected as a request validation/binding error (proposed 400), while the valid admin identity remains authorized. The OpenAPI operation does not document 400, so the precise public status needs confirmation.

## Actual

The gateway returned HTTP 401 with `{"message":"Unauthorized"}` despite a valid administrator token. No adjustment was recorded.

## Evidence

Exploration report `reports/exploration/2026-09-08-inventory.md`, scenario E11; one reproduction during this exploration. Sanitized token and request evidence only.

## Impact

Admin clients cannot distinguish invalid adjustment data from expired/invalid authentication and may incorrectly reauthenticate or retry the same malformed request.

## Cleanup

Original products were subsequently absent. Supervisor independently reproduced the malformed UUID response using a newly created product, verified unchanged history, and deleted all three supervisor products and the customer with 204. See [raw sanitized evidence](../exploration/2026-09-08-supervisor-inventory-evidence.json), `malformed UUID` and cleanup entries.

## Follow-up and automation

Do not assert this response as correct behavior. Keep malformed-UUID coverage excluded until triage clarifies/fixes the mapping. Verify again after a backend fix.

