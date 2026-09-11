# [VIS] Admin catalog and orders — action columns are clipped on narrow screens

**ID:** UI-12  
**Status:** Open  
**Category:** VIS  
**Observed on:** 2026-09-11

## Environment and preconditions

- URLs: `http://localhost:8081/admin/products` and `/admin/orders`.
- Deployed build unverified; local frontend source `41e177a6e4b4f53ffb75d0e37b0666dcb9508277`; test repository starting revision `c73619f9bfaff5c4338950f566b37bec6b7b3e88`.
- Playwright CLI, Headless Chromium 152, macOS, DPR 1, default zoom; desktop 1920 × 1080, tablet 768 × 1024, mobile 414 × 896 CSS pixels.
- Configured admin session; disposable products and orders alongside existing demo records. No network/CPU throttling.

## Steps to reproduce

1. As admin, open Manage Products at 414 × 896 with at least one product.
2. Try to reach the row's Edit/Delete controls by horizontal scrolling over the table.
3. Open Manage Orders with an existing order; try to reach its status and View Details link.
4. Compare the same rows at desktop width. Also inspect the product table at tablet width.

## Actual result and evidence

The right-hand columns are cut off. At mobile width, product Edit/Delete and order View Details controls are outside the visible table; horizontal wheel input does not reveal them. The product table also clips actions at the tablet baseline. Desktop rows show their controls.

Reviewed screenshots and a second DOM/scroll probe confirm:

| Container test ID | Mobile client width | Scroll width | Effective overflow-x | scrollLeft after horizontal wheel |
|---|---:|---:|---|---:|
| `admin-product-list-table-container` | 380 px | 818 px | `hidden` | 0 |
| `admin-order-list-table-container` | 380 px | 756 px | `hidden` | 0 |

The document itself has no horizontal overflow to reveal those columns. An earlier filtered-order probe measured 706 px of content in the same 380 px container. Product-name length and row content affect the overflow extent.

![Mobile product list with clipped columns](../../../exploration/ui/commerce-2026-09-11/admin-products-mobile.png)

![Mobile order list with clipped columns](../../../exploration/ui/commerce-2026-09-11/admin-orders-mobile.png)

GET `/api/v1/products` and GET `/api/v1/orders/admin` completed with 200. This is a layout/access problem, not missing server data. By contrast, the customer cart has an inner `overflow-x: auto` container and its off-screen controls can be revealed.

## Expected result and basis

Administrators should be able to reach each displayed row's actions at the supported responsive sizes. Provide horizontal scrolling or a responsive row/card layout without hiding controls. The existing desktop actions establish the intended functionality; this report does not prescribe a visual redesign.

## Impact assessment

Pointer users at narrow widths cannot reach catalog editing/deletion or order details through these lists. Enlarging the viewport or manually entering a known record URL is a workaround. Keyboard focus may programmatically scroll hidden overflow; a comprehensive keyboard or real-device touch audit was not performed.

## Severity rationale and decision

Two administration workflows lose their visible entry actions at mobile width, and catalog actions also clip at tablet width. Desktop workflows still function and direct URLs provide a workaround, so this is a material responsive usability impairment rather than a demonstrated outage across all users.

**Severity:** M

## Acceptance criteria and retest

- [ ] Product Edit/Delete and order status/View Details are reachable at 414 × 896 and 768 × 1024.
- [ ] If a table scrolls, pointer/touch and keyboard users can discover and reach all columns.
- [ ] Desktop layout and disposable-record edit/delete/order navigation still work.
- [ ] Review fixed screenshots and actual scrolling; desktop regression success alone does not close this finding.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Only disposable records were mutated. API cleanup deleted the owner and remaining product (204); already-removed products and both dependent orders returned 404. The named CLI session was closed. A final audit found only the original four users/eight products, with shared stock and admin profile details unchanged. Shared admin credentials and account details were preserved. Screenshots and raw measurements are local ignored evidence. Desktop automation covers successful workflows and client denial; the clipping is not encoded as expected behavior. No real-device testing is claimed.
