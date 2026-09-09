# BUG-047: Order route rounds large identifiers before requesting the API

## Severity rationale

Opening an order URL with an ID above JavaScript's safe integer range changes the identifier sent to the backend. The explored maximum signed 64-bit ID is rounded beyond the backend range, causing four 400 responses before showing “Order not found”. Ordinary small order IDs work; no existing real order in the affected range was demonstrated. This also makes the existing missing-order UI scenario exercise malformed-ID handling instead of a genuine 404. Impact on currently stored orders is unknown.

## Classification

- Severity (proposed): low
- Category: functional
- Type: Functional
- Status: Open
- Tags: functional, ui, orders, routing, numeric-precision, test-data
- Observed: 2026-09-09

## Environment

Local gateway http://localhost:8081, Chromium through playwright-cli, disposable authenticated customer. Deployed revision unknown.

## Steps to reproduce

1. Sign in as a disposable customer.
2. Navigate to `/orders/9223372036854775807`.
3. Inspect the outgoing order API request.

## Expected result

The route preserves the identifier: `GET /api/v1/orders/9223372036854775807`. A direct API call for the absent ID returns 404.

## Actual result

The browser requests `/api/v1/orders/9223372036854776000`, receives 400 with `For input string: "9223372036854776000"`, retries three times, then shows “Order not found”.

## Evidence

Sanitized browser events: `reports/exploration/resource-factories/browser-events.json` (ignored, originating workspace only). Direct terminal request for the exact original identifier returned 404. No production fix is part of the fixture refactor.

## Test implication

Use an exactly representable absent identifier for ordinary UI 404 coverage. Preserve the 64-bit API boundary value for direct HTTP tests. Large-ID UI support remains a separate gap.

## Cleanup

The disposable customer and product were deleted with 204 responses; the owned order then returned 404 to the admin.
