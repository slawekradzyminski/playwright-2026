# BUG-0020: Product details cannot be opened using the keyboard

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Products] Product details cannot be opened using the keyboard |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Product catalog |
| Labels | ui, accessibility, functional, products |
| Environment | http://localhost:8081/products; frontend 3.9.1; backend 3.9.4; disposable client and owned products |
| Browser / viewport | Chromium; 1920 × 1080 unless otherwise stated |
| Source revision | Deployed frontend image label: 607fe6be7f3be33ed2e7f47d78957b18b63cb81b; relevant files identical at local 7392a3a935b373f3160c5a3ae4162c5b2f310624 |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

Mouse users can open details by clicking a product card, but keyboard users have no equivalent control on the catalog. This prevents a keyboard-only user from completing the same browsing journey (WCAG 2.2, 2.1.1 Keyboard).

## Steps to reproduce

1. Sign in as a disposable client and open `/products` with at least one product.
2. Focus search, then use Tab through sorting, stock filtering and all product controls.
3. Try to reach a product details link or activate the product name using the keyboard.
4. Compare with clicking the product name using a mouse.

## Expected result

Every product has a focusable, clearly named details link operable by keyboard. Cart controls remain independent of that link.

## Actual result

Tab visits quantity and cart buttons but never a product details control. Mouse-clicking the name navigates to the matching `/products/:id`.

## Evidence

Runtime DOM inspection of the owned Alpha product returned `tag: DIV`, `role: null`, `tabIndex: -1`, and zero descendant links. A 24-step Tab traversal passed through the four filtered products' cart controls and on to the footer without a product-details link. Mouse navigation reached `/products/432`. The ID was disposable and has been removed; use a newly created product to reproduce.

## Root cause

[ProductCard.tsx](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/products/ProductCard.tsx#L125) attaches `onClick` navigation to a nonfocusable `div`. The title is an `h3`; no anchor or keyboard activation handler provides an equivalent action.

## Acceptance criteria

- Each product exposes a meaningful details link in the tab order with visible focus.
- Enter opens the correct product; quantity/cart buttons do not trigger navigation.
- Add a focused keyboard regression with the fix. A clean axe scan alone is insufficient.
