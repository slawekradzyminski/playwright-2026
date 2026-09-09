# BUG-045: Inventory rows cannot be selected with the keyboard

## Severity rationale

Keyboard-only administrators cannot select an inventory row, open its inspector, or reach stock adjustment and movement-history controls. The rows are mouse-click targets without keyboard focus or an equivalent control, and no keyboard recovery path is present. This blocks the inventory operation for users who cannot use a mouse; the affected journey has no viable equivalent workaround.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui, admin, keyboard
- Status: Open
- Severity (proposed): High

## Endpoint

`GET /api/v1/admin/inventory`; `GET /api/v1/admin/inventory/{productId}`

## Environment

- Observed on: 2026-09-09
- Base URL: `http://localhost:8081`
- Application version: deployed revision not recorded
- Contract source/version: frontend route and live browser DOM
- Identity: administrator; no credentials

## Preconditions

Authenticated admin session on `/admin/inventory` with inventory rows displayed.

## Reproduction

1. Open `/admin/inventory`.
2. Press Tab through the page and inspect the focusable elements.
3. Attempt to focus or activate an inventory row with Enter or Space.

## Expected

Each inventory row or an equivalent named control is keyboard focusable, exposes its action/selection semantics, and opens the selected product inspector with Enter or Space.

## Actual

The inspected row had `tabIndex: -1`, no ARIA role, and rendered as `<tr class="cursor-pointer ..." data-testid="inventory-row-9">`. It was absent from the Tab sequence, so keyboard users could not select it or reach the inspector actions.

## Evidence

- [Inventory completed evidence](../exploration/ui/2026-09-09-orders-root-01/inventory-completed.json)
- ![Inventory at 360px](../exploration/ui/2026-09-09-orders-root-01/screenshots/inventory-list-360.png)
- [Inventory inspector screenshot](../exploration/ui/2026-09-09-orders-root-01/screenshots/inventory-detail-1440.png)
- Axe inventory scan in [inventory evidence](../exploration/ui/2026-09-09-orders-root-01/inventory-completed.json) had no incomplete checks; the manual keyboard inspection established the row barrier.

Evidence is local and Git-ignored; screenshots are available only in the originating workspace.

## Impact

Keyboard-only administrators cannot perform inventory inspection or stock adjustment through the intended screen. Mouse users can complete the journey.

## Cleanup

Keyboard inspection used supervisor-owned product 9. Its disposable fixture cleanup is recorded in the consolidated review.

## Follow-up and automation

Add a keyboard-operable row or explicit select/details control with visible focus and accessible name. Add a focused UI regression after the fix is verified.
