# BUG-009: Cancelled orders may reopen without deducting restored inventory

## Severity rationale

A cancelled order was persisted as PAID while its restored stock remained available. This breaks consistency between active orders and inventory and creates a concrete route to overselling. Actual overselling was not executed, but correcting a display or retrying the request does not repair the recorded business-state inconsistency.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Functional
- Category: functional
- Tags: functional, api
- Status: Open
- Severity (proposed): High
- Endpoint: `PUT /api/v1/orders/{id}/status`
- Observed: 2026-09-08, source assessment; runtime gateway/revision pending.
- Contract: `docs/openapi.json`, version 1.0, promises unsupported-transition validation. Exact allowed transition matrix is unspecified.

## Preconditions and reproduction

Create a disposable customer, product and order; cancel the order and confirm stock restoration. As admin, PUT the JSON string `"PAID"` to its status path with `Authorization: Bearer <ADMIN_TOKEN>`, then read order and product.

## Expected

Hypothesis: reject reopening a cancelled order (400), or define and implement a reopening workflow which reserves/deducts stock. An active order should not retain restored inventory.

## Actual and evidence

Source `OrderService.updateOrderStatus` at `8cb264a24ef997d635210bc5d0152363f78f8486` directly sets non-CANCELLED statuses, without checking previous status or inventory state. `cancelLocked` restores stock. Runtime reproduction pending; no observed HTTP result claimed.

## Cleanup and follow-up

No resources created yet. Explore owned data, document result and cleanup, clarify transition matrix. Exclude reopening from passing automation until resolved. Add a service test for CANCELLED → PAID and database inventory consistency after the intended policy is agreed.

## Runtime confirmation (2026-09-08 08:53 UTC)

Status: Open. Gateway http://localhost:8081, image 3.7.16 revision 1e40f8a8e75538a747befbf9e36b4cd9d44a6848. C08 confirms PUT `/orders/10/status` `"PAID"` returned 200 after CANCELLED. Owner GET persisted PAID; product 920/921 stocks stayed 18/17 (the restored values), rather than deducting 2/3. One runtime reproduction. [Evidence](../api/evidence/auth-orders-2026-09-08.jsonl), C07-cancel/C08 and stock readbacks. Owned users deleted 204, orders 7–10 verified 404, products 920/921 deleted 204. Exact supported transition policy remains to be clarified; inventory inconsistency is reproduced.
