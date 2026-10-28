# BUG-0029: Admin inventory products cannot be selected using the keyboard

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Admin inventory] Inventory rows are mouse-only, so keyboard users cannot open a product's stock inspector from the list |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Admin inventory |
| Labels | ui, accessibility, functional, admin |
| Environment | `http://localhost:8081/admin/inventory`; frontend 3.9.1; backend 3.9.4; both Shop API modes |
| Browser / viewport | Chromium; 1280 × 720 |
| Source revision | Deployed frontend image label `607fe6be7f3be33ed2e7f47d78957b18b63cb81b`; relevant file identical at local [`7392a3a`](https://github.com/slawekradzyminski/vite-react-frontend/tree/7392a3a935b373f3160c5a3ae4162c5b2f310624) |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

Selecting a product to inspect or adjust its stock works only by clicking a table row. The row is not focusable and contains no link or button, so a keyboard-only administrator can reach the filters but not the inspector, except by typing `/admin/inventory/{productId}` into the address bar (WCAG 2.2, 2.1.1 Keyboard). This is the same pattern as the catalog card in [BUG-0020](BUG-0020-product-details-unreachable-by-keyboard.md), in a different component.

## Steps to reproduce

1. Sign in as the administrator and open `/admin/inventory`.
2. Search for an owned product.
3. Press Tab from the threshold field through the page and try to select the product's row.

## Expected result

Each row exposes a focusable, named control (for example a link on the product name to `/admin/inventory/{productId}`) that opens the inspector with Enter.

## Actual result

The row has no `tabindex`, and its cells contain only text and a status badge. Clicking the row with a mouse opens the inspector.

## Evidence

DOM inspection during scripted Chromium exploration on 2026-10-28 (REST and GraphQL modes): `inventory-row-{id}` had no `tabindex`; a mouse click navigated to `/admin/inventory/{id}`. The absence of interactive descendants is from source. A full Tab-order walk was not recorded. Owned products were deleted afterwards.

## Root cause

[`AdminInventory.tsx`](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/components/admin/AdminInventory.tsx#L149) attaches `onClick` to the `<tr>` only.

## Acceptance criteria

- Every inventory row can be selected with the keyboard and announces the product name.
- A UI regression selects a product from the list using only the keyboard.
