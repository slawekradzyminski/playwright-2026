# BUG-0025: Cart quantity update failures provide no user feedback

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Cart] Failed quantity updates silently restore the previous quantity |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Customer cart |
| Labels | ui, functional, usability, cart |
| Environment | http://localhost:8081/cart; frontend 3.9.1; Docker runtime; disposable client and owned product |
| Browser / viewport | Chromium; 1280 × 720 CSS pixels |
| Source revision | Deployed frontend image revision `607fe6be7f3be33ed2e7f47d78957b18b63cb81b`; relevant cart files are identical at local checkout `7392a3a935b373f3160c5a3ae4162c5b2f310624` |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

When a cart quantity update is rejected by the API, the cart silently restores the saved quantity. The user receives no visible explanation or recovery guidance, so a stock conflict looks like the quantity control did not respond. The API documents a `409` response when a requested quantity exceeds available stock; the cart should explain the rejection while keeping the saved cart state clear.

## Steps to reproduce

1. Use a disposable client and create an owned product with stock quantity 5.
2. Add all 5 units of that product to the client's cart.
3. Open `/cart`, increase the quantity to 6, then choose **Update**.
4. Observe the cart row and notification area; read the cart through `GET /api/v1/cart` using the same client.

## Expected result

The cart keeps the saved quantity and tells the user that the requested update could not be applied, with enough context to recover (for example, explain the stock limit or invite the user to reduce the quantity). This expectation follows the API's documented stock-conflict response and supports clear recovery from an unsuccessful user action.

## Actual result

The API returns HTTP `409`. The row returns from 6 to 5 and the summary remains unchanged, but no error message or notification appears. The only feedback is a browser console error, which is not available to ordinary users.

## Evidence

Reproduced in Chromium against the local Docker runtime using a disposable user and an owned product. The UI sent `PUT /api/v1/cart/items/{ownedProductId}` for quantity 6; it returned `409`. A separate real `GET /api/v1/cart` returned HTTP `200` with quantity 5, totalItems 5 and totalPrice 62.50. After the request settled, the visible page contained the row at quantity 5 and no error text or notification. The console logged `Failed to update cart item: AxiosError ... 409`.

Both the disposable user and product were deleted after the probe; cleanup returned HTTP `204` for each and follow-up lookups returned HTTP `404`.

### GraphQL reproduction, 2026-10-28

In GraphQL mode the same handler receives an HTTP 200 execution error instead of a 409. With an owned product in the cart at quantity 2, a route returned `{"errors":[{"message":"Insufficient stock","path":["updateCartItem"],"extensions":{"code":"CONFLICT"}}],"data":{"updateCartItem":null}}` for `mutation UpdateCartItem` only. After choosing Update with quantity 3, the row returned to 2 and the toast viewport was empty. The product-details page shows an error toast for the same GraphQL failure (covered by `tests/ui/graphql/storefront.ui.spec.ts`), so the gap is specific to the cart page's handler.

## Root cause

The `CartItem` update handler catches the rejected request, writes only to `console.error`, and resets local quantity to the saved value. It does not notify the user. See [`CartItem.tsx` at the deployed source revision](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/cart/CartItem.tsx#L30-L43), especially lines 38–40.

## Suggested fix

Show an inline or announced error message when the update fails, retain the confirmed saved quantity, and explain stock conflicts in user-facing language.

## Acceptance criteria

- A rejected cart quantity update leaves the saved quantity and totals unchanged.
- The user receives visible, accessible feedback that the update failed and how to recover.
- Cover an out-of-stock update rejection and verify the unchanged saved cart through a separate API read.
- Cover both a REST 409 and a GraphQL HTTP-200 `CONFLICT` execution error.
