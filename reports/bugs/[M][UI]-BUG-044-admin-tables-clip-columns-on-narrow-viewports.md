# BUG-044: Admin product and order tables clip action columns on narrow viewports

## Severity rationale

Admin users viewing the product or order lists at 360px and 768px cannot see all table columns, including product actions and order actions. The table/container reports horizontal overflow hidden, so the affected actions are outside the viewport without an exposed horizontal recovery path. Desktop remains usable and the core journey is available by changing viewport or using another route, so the impact is limited to narrow viewport users.

## Classification

- Type: Functional
- Category: ui
- Tags: ui, responsive, admin
- Status: Open
- Severity (proposed): Medium

## Endpoint

`GET /api/v1/products`; `GET /api/v1/orders/admin`

## Environment

- Observed on: 2026-09-09
- Base URL: `http://localhost:8081`
- Application version: deployed revision not recorded
- Contract source/version: frontend route and live browser response
- Identity: administrator; no credentials

## Preconditions

Authenticated admin session with the seeded product and order lists.

## Reproduction

1. Open `/admin/products` at 768×1024 or 360×800.
2. Observe the table extending beyond the viewport; at tablet width Category is clipped and later columns are outside the viewport. At mobile width only the initial columns are visible.
3. Open `/admin/orders` at 360×800 or 768×1024 and observe the same hidden right-side columns and actions.

## Expected

Every required row action remains discoverable and operable at supported narrow viewports, through responsive columns, an exposed horizontal scroll region, or an equivalent accessible action layout. This is a responsive usability expectation; no narrower breakpoint requirement was supplied.

## Actual

The table/container has `overflowX: hidden`; measured order-table client/scroll widths were 326/783 at 360px, 718/783 at 768px, and 1214/1214 at 1440px. Right-side columns/actions are clipped at narrow widths.

## Evidence

- ![Products at 768px](../exploration/ui/2026-09-09-orders-root-01/screenshots/products-768.png)
- [Products 360px screenshot](../exploration/ui/2026-09-09-orders-root-01/screenshots/products-360.png)
- [Orders 360px screenshot](../exploration/ui/2026-09-09-orders-root-01/screenshots/admin-orders-360.png)
- [Orders 768px screenshot](../exploration/ui/2026-09-09-orders-root-01/screenshots/admin-orders-768.png)
- [Completed responsive measurements](../exploration/ui/2026-09-09-orders-root-01/dashboard-completed.json)

Evidence is local and Git-ignored; screenshots are available only in the originating workspace.

## Impact

Admin users on narrow viewports cannot reliably inspect all fields or reach edit/delete/view-details actions from the list. Desktop users are unaffected.

## Cleanup

Read-only exploration used existing seeded rows. No resources were created for this finding.

## Follow-up and automation

Confirm the supported responsive interaction and expose the clipped actions. Functional automation remains desktop-only per the UI testing rules; retain this finding as exploration evidence.
