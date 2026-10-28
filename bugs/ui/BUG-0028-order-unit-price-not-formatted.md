# BUG-0028: Order details show unit prices without two decimals

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Orders] Line unit price shows "$12.5 x 2" instead of "$12.50 x 2" |
| Issue Type | Bug |
| Priority | Low |
| Component/s | Order details |
| Labels | ui, visual, orders |
| Environment | `http://localhost:8081/orders/:id`; frontend 3.9.1; backend 3.9.4; both Shop API modes |
| Browser / viewport | Chromium; 1280 × 720 |
| Source revision | Deployed frontend image label `607fe6be7f3be33ed2e7f47d78957b18b63cb81b`; relevant file identical at local [`7392a3a`](https://github.com/slawekradzyminski/vite-react-frontend/tree/7392a3a935b373f3160c5a3ae4162c5b2f310624) |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

Order detail lines print the unit price as a raw number. Prices with a trailing zero in the cents lose it (`$12.5`), while the line total and order total on the same page use two decimals (`$25.00`). Cart, checkout and catalog prices also use two decimals.

## Steps to reproduce

1. As a disposable customer, order 2 units of an owned product priced 12.50.
2. Open the order's details page as the customer (or as the administrator).

## Expected result

`$12.50 x 2`, consistent with every other price in the storefront.

## Actual result

`$12.5 x 2`; the line total `$25.00` and order total `$25.00` are formatted correctly.

## Evidence

Reproduced 2026-10-28 in REST mode and GraphQL mode (customer and administrator views) with disposable customers and owned products; all were deleted afterwards (204).

## Root cause

[`OrderDetails.tsx`](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/components/orders/OrderDetails.tsx#L153) interpolates `item.unitPrice` directly, while the totals call `toFixed(2)`.

## Acceptance criteria

- Unit prices on order details always show two decimals.
- A regression covers a price with a trailing zero in the cents (for example 12.50).
