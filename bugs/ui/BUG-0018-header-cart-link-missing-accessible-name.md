# BUG-0018: Authenticated header cart link has no accessible name

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Header] Cart icon link has no accessible name |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Authenticated navigation |
| Labels | ui, accessibility, header |
| Environment | http://localhost:8081; frontend 3.9.1; disposable ROLE_CLIENT account with empty cart |
| Browser / viewport | Chromium; 402 × 874, 820 × 1180, 1180 × 820, 1920 × 1080 |
| Source revision | Deployed image label: 607fe6be7f3be33ed2e7f47d78957b18b63cb81b; relevant Navigation.tsx identical at local 7392a3a935b373f3160c5a3ae4162c5b2f310624 |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | Not created |

## Description

The cart icon link remains in the keyboard tab order but exposes no accessible
name. Screen reader users cannot identify its destination from the link name.
This violates the accessible-name requirement for links (WCAG 2.2, 4.1.2).

## Steps to reproduce

1. Register and sign in as a disposable client with no cart items.
2. Open `/` and focus the cart icon in the header.
3. Inspect the link in the accessibility tree, or run axe against `navigation`.

## Expected result

The link exposes a meaningful accessible name such as “Cart”, independent of
whether the cart contains items.

## Actual result

The accessibility snapshot lists an unnamed link to `/cart`. The only child is
an SVG marked `aria-hidden="true"`; there is no text, title, aria-label or
aria-labelledby. This icon remains visible at every explored viewport.

## Evidence

Sanitized DOM excerpt:

```html
<a data-testid="desktop-cart-icon" href="/cart">
  <svg aria-hidden="true">...</svg>
</a>
```

A runtime axe scan of the desktop header reports `link-name`, impact `serious`,
on `desktop-cart-icon`: “Element is in tab order and does not have accessible text”.
Viewport exploration also confirmed `aria-label` is absent at all four sizes.
No screenshot is needed to demonstrate a missing accessible name.

## Root cause

[Navigation.tsx at the deployed revision](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/layout/Navigation.tsx)
renders the cart anchor without an accessible label. The empty cart has no badge
text either. This is a frontend defect; navigation itself reaches the empty cart.

## Suggested fix

Give the link a stable accessible name, for example `aria-label="Cart"`.

## Acceptance criteria

- The cart link has a meaningful accessible name with both empty and nonempty carts.
- The name works at desktop and mobile widths.
- Add a regression asserting the accessible name and rerun the focused axe scan
  with the fix; do not add an expected-failure test to the current suite.
