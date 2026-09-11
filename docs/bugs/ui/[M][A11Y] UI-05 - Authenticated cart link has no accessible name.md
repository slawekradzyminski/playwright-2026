# [A11Y] Login — Authenticated cart link has no accessible name

**ID:** UI-05  
**Status:** Open  
**Category:** A11Y (Accessibility)  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081, local training stack; deployed application build unknown. Test repository revision 15f4bdb before this refactor. HeadlessChrome 152.0.0.0 via Playwright CLI on macOS, DPR 1; desktop 1920×1080, tablet 768×1024, mobile 414×896 CSS viewport; desktop browser resized, default zoom, no throttling. Demo admin used only for authenticated checks.

## Steps to reproduce

Sign in with the configured demo admin, then inspect the cart icon link in the header.

## Actual result and evidence

The link with data-testid="desktop-cart-icon" has href="/cart", no text or aria-label, and its only SVG is aria-hidden="true". The accessibility snapshot shows an unnamed link. Seen on desktop and mobile; the mobile menu has a separate named Cart link.

![Evidence](../../../exploration/ui/login-2026-09-11/mobile-authenticated.png)

Local evidence is ignored; the observations above remain reproducible without it.

## Expected result and basis

Give the icon link an accessible name such as Cart, retained when the item count changes.

## Impact assessment

Screen-reader users cannot identify the icon link purpose. Mobile has a named menu alternative; sighted users recognize the cart icon.

## Severity rationale and decision

The cart shortcut has no accessible name, so its purpose is unavailable from the link to screen-reader users. A named mobile-menu alternative limits scope there, but does not name the desktop shortcut. The evidence supports material navigation accessibility impairment, not failure of the cart operation itself.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Acceptance criteria and retest

- [ ] Implement the expected behavior above.
- [ ] Repeat the original reproduction and neighboring positive case.
- [ ] Check relevant desktop/tablet/mobile and keyboard states.
- [ ] Add a focused regression after the fix; do not assert the defect as correct behavior.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Exploratory authenticated sessions were logged out. No product/user data changed. Manual DOM, screenshot and keyboard inspection; no real screen-reader or physical-device audit. Timing is local and unthrottled. No external issue published.
