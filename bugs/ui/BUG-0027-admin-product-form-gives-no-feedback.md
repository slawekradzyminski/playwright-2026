# BUG-0027: Admin product form gives no feedback after saving or failing

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Admin products] Create and edit stay on the form without any success or error message |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Admin product management |
| Labels | ui, usability, functional, admin |
| Environment | `http://localhost:8081/admin/products/new` and `/admin/products/edit/:id`; frontend 3.9.1; backend 3.9.4; both Shop API modes |
| Browser / viewport | Chromium; 1280 × 720 |
| Source revision | Deployed frontend image label `607fe6be7f3be33ed2e7f47d78957b18b63cb81b`; relevant files identical at local [`7392a3a`](https://github.com/slawekradzyminski/vite-react-frontend/tree/7392a3a935b373f3160c5a3ae4162c5b2f310624) |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

After an administrator saves a new product, the form silently clears and stays on `/admin/products/new`. After editing, the form stays on the edit page with the new values. Nothing says whether the product was saved, and a rejected save is equally silent (only a console error). The administrator cannot tell success from failure without opening the product list, and may submit a new product twice.

## Steps to reproduce

1. Sign in as the administrator and open `/admin/products/new`.
2. Fill in a valid, uniquely named product and choose the submit button.
3. Observe the page; then open `/admin/products`.
4. Open an owned product's edit page, change its price and submit.

## Expected result

A successful save confirms it (for example a success toast or returning to the product list with the product visible). A failed save shows an error and keeps the entered values. The rest of the application confirms writes with toasts (cart, orders).

## Actual result

| Action | Page after save | Feedback |
| --- | --- | --- |
| Create (REST and GraphQL) | Still `/admin/products/new`; all fields emptied | None |
| Edit (REST and GraphQL) | Still `/admin/products/edit/:id` | None |
| Rejected save | Unchanged | Console error only (source) |

The product was saved in both successful cases (verified through `GET /api/v1/products/{id}`).

## Evidence

Scripted Chromium exploration on 2026-10-28 with the shared administrator acting only on owned products, once with REST and once with GraphQL selected. Toast viewport text after each save was empty. Owned products were deleted afterwards. The failure row is source-based; it was not separately injected in the browser.

## Root cause

[`AdminProductFormPage`](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/pages/admin/productFormPage.tsx#L21) renders `AdminProductForm` without an `onSuccess` callback. The form's [mutation handlers](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/components/products/AdminProductForm.tsx#L43-L76) only reset the form on create and log failures with `console.error`.

## Suggested fix

Pass an `onSuccess` that shows a success toast and navigates to `/admin/products`; show an error toast or inline alert in the catch branch.

## Acceptance criteria

- A successful create or edit shows visible, accessible confirmation and leads to the updated product list.
- A rejected save shows an error and keeps the entered values.
- UI regression: create and edit an owned product, assert the confirmation and the saved product through an API read; inject one rejected save.
