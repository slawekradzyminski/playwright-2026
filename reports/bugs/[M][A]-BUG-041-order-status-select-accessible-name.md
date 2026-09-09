# BUG-041: Admin order-status select has no accessible name

## Severity rationale

Administrators navigating order details through assistive technology encounter an unnamed combobox. Its selected option is available, but its purpose is not programmatically identified, making the status-change action ambiguous. The control remains keyboard operable and an adjacent Update button provides some context; no unintended mutation or complete task blockage was demonstrated. This affects the admin status control on order details, not ordinary customer reading or cancellation.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui
- Status: Open
- Severity (proposed): medium

## Endpoint

UI `/orders/:id`, administrator status controls.

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: deployed revision unknown; local frontend `41e177a6e4b4f53ffb75d0e37b0666dcb9508277`
- Requirement source: UI skill accessibility review, programmatically named form controls (WCAG 4.1.2)
- Identity: administrator, disposable customer-owned order

## Preconditions

Create an isolated customer, products and order through the API. Sign in as administrator and open that order.

## Reproduction

1. Open `/orders/<owned-order-id>` as administrator.
2. Inspect `[data-testid="order-details-status-select"]` in the accessibility tree and rendered DOM.
3. Run axe-core on the settled details page. Repeat after changing the disposable order from PENDING to PAID and reloading.

## Expected

The status combobox has a meaningful accessible name identifying its purpose, for example “Order status”.

## Actual

The select has no associated label, `aria-label`, `aria-labelledby`, or title. axe-core 4.13.0 reports `select-name`; the selected option does not provide the control's accessible name. Selecting PAID and clicking Update otherwise persists the status successfully.

## Evidence

[Local exploration review](../exploration/ui/2026-09-09-orders-root-01/review.md), `access-results.json` (adminAxe), and frontend `src/components/orders/OrderDetails.tsx`. Browser readback and axe agree with the rendered missing-label structure.

![Admin order details at 769×900; unnamed status select beside Update](../exploration/ui/2026-09-09-orders-root-01/screenshots/admin-paid.png)

Screenshot inspected locally. Images and detailed logs are Git-ignored and available only in the originating workspace; textual reproduction remains usable elsewhere. Actual screen-reader speech was not tested. Shared-header unnamed cart link is already BUG-039.

## Impact

Ambiguous form navigation and status editing for administrators using assistive technology.

## Cleanup

Disposable order and its owning customer were deleted before product cleanup; the final result is recorded in the exploration review.

## Follow-up and automation

Associate an explicit label and verify the rendered accessible name and keyboard flow. Do not add an assertion that accepts the missing name. Functional status/persistence tests can cover the independently verified journey.
