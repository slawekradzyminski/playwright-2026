# BUG-0019: Mobile navigation toggle does not expose its expanded state

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Header] Mobile menu button does not expose open/closed state |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Authenticated mobile navigation |
| Labels | ui, accessibility, header |
| Environment | http://localhost:8081; frontend 3.9.1; disposable ROLE_CLIENT account |
| Browser / viewport | Chromium touch emulation; 402 × 874 and 820 × 1180 |
| Source revision | Deployed image label: 607fe6be7f3be33ed2e7f47d78957b18b63cb81b; relevant Navigation.tsx identical at local 7392a3a935b373f3160c5a3ae4162c5b2f310624 |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | Not created |

## Description

The mobile navigation button visually changes from a menu icon to a close icon,
but does not expose the corresponding state to assistive technology. Its name
remains “Open main menu” while the menu is already open. Users cannot determine
whether navigation is expanded from the control's accessible state. WCAG 2.2
4.1.2 requires user-settable control states to be available programmatically.

## Steps to reproduce

1. Sign in as a disposable client and open `/` at 402 × 874.
2. Inspect `mobile-menu-toggle` while the menu is closed.
3. Activate the button and inspect it with the menu visible.
4. Activate it again to close the menu.

## Expected result

The disclosure button exposes `aria-expanded="false"` when closed and `true`
when open. Its accessible name describes its action or purpose consistently.
Prefer an `aria-controls` association with the disclosed menu.

## Actual result

`aria-expanded` is absent in both states. After opening, the menu is visible and
the close icon is displayed, but the accessible name is still “Open main menu”.
`aria-controls` is also absent. Opening, navigating, and logout otherwise work.

## Evidence

Runtime DOM inspection at 402 × 874 after activation:

```json
{
  "mobileMenuVisible": true,
  "buttonText": "Open main menu",
  "aria-expanded": null,
  "aria-controls": null
}
```

The 820 × 1180 exploration also observed the expanded menu with no
`aria-expanded`. This is a manual DOM/state finding; the focused desktop axe
scan does not establish or exclude this disclosure-state defect.

## Root cause

[Navigation.tsx at the deployed revision](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/layout/Navigation.tsx)
uses `isOpen` to conditionally render the menu and swap the SVG icon, but does
not bind it to the button's accessible state or change its static label.

## Acceptance criteria

- The toggle exposes its correct expanded state before and after activation.
- Give the menu a stable ID and associate the button with it where appropriate.
- Verify keyboard operation and meaningful naming in both states.
- Add the accessibility regression when the frontend fix is available.
