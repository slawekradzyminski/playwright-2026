# BUG-046: Admin dashboard aggregates only the first 50 orders

## Severity rationale

When the admin orders endpoint contains more than the dashboard request page size, the dashboard metrics undercount total orders, pending orders, and revenue. This can mislead operators about throughput and financial totals. The verified reproduction uses a mocked 51-record response, so the live dataset was not changed and the exact production impact depends on whether more than 50 orders are possible.

## Classification

- Type: Functional
- Category: functional
- Tags: functional, ui, admin, pagination
- Status: Open
- Severity (proposed): Medium

## Endpoint

`GET /api/v1/orders/admin?page=0&size=50`

## Environment

- Observed on: 2026-09-09
- Base URL: `http://localhost:8081`
- Application version: deployed revision not recorded
- Contract source/version: live browser request; mocked pagination response for boundary reproduction
- Identity: administrator; no credentials

## Preconditions

Admin dashboard loaded with the orders-admin request intercepted for a bounded mocked 51-order response. Each synthetic order had total amount 10 and status PENDING.

## Reproduction

1. Open `/admin`.
2. Intercept `GET /api/v1/orders/admin?page=0&size=50` and return `totalElements: 51`, `totalPages: 2`, with 50 records on page 0.
3. Observe the dashboard metrics.

## Expected

Dashboard totals aggregate the complete result set represented by pagination metadata, or use a server-side aggregate endpoint. With 51 synthetic PENDING orders of 10 each, the metrics should show 51 orders, 51 pending orders, and `$510.00` revenue.

## Actual

The dashboard displayed 50 total orders, 50 pending orders, and `$500.00` revenue while the response reported 51 total elements across two pages.

## Evidence

- [Dashboard completed evidence](../exploration/ui/2026-09-09-orders-root-01/dashboard-completed.json) records `expectedOrders: 51`, `actual: "50"`, `pending: "50"`, `revenue: "$500.00"`.
- ![Dashboard with mocked 51-order data](../exploration/ui/2026-09-09-orders-root-01/screenshots/dashboard-mocked-51.png)
- [Mocked scenario script/log](../exploration/ui/2026-09-09-orders-root-01/dashboard-completed.log)

The response was deliberately mocked; this proves dashboard aggregation behavior, not a live backend condition. Evidence is local and Git-ignored.

## Impact

Admin dashboard operators receive incomplete operational and revenue metrics once the order count exceeds the first-page size. Current live seeded data had fewer than 50 orders, so live undercounting was not observed.

## Cleanup

The mocked route was removed after the scenario. No synthetic records were persisted.

## Follow-up and automation

Fetch all pages or replace the list dependency with aggregate metrics. Add a mocked boundary regression for 51 records and a live metric check when a disposable multi-page fixture is available.
