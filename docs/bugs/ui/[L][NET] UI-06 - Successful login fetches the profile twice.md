# [NET] Login — Successful login fetches the profile twice

**ID:** UI-06  
**Status:** Open  
**Category:** NET (Network)  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081, local training stack; deployed application build unknown. Test repository revision 15f4bdb before this refactor. HeadlessChrome 152.0.0.0 via Playwright CLI on macOS, DPR 1; desktop 1920×1080, tablet 768×1024, mobile 414×896 CSS viewport; desktop browser resized, default zoom, no throttling. Demo admin used only for authenticated checks.

## Steps to reproduce

Start signed out, sign in once, and observe fetch/XHR until the home screen is ready plus 500 ms. Do not reload. Log out and repeat.

## Actual result and evidence

Two independent runs each sent one POST /api/v1/users/signin (200), one GET /api/v1/cart (200), and two GET /api/v1/users/me (200). Run 1 profile durations: 3.644 and 2.703 ms; run 2: 3.099 and 3.796 ms. No reload or extra user action occurred in these observation windows.

## Expected result and basis

Reuse or deduplicate the profile fetch within one login transition unless a documented freshness requirement requires both. Suspected duplicate consumers are a hypothesis; application source was not inspected.

## Impact assessment

Each login performs one apparently unnecessary profile request. Local overhead is small; no user-visible slowdown or production load impact was demonstrated.

## Severity rationale and decision

The extra profile request adds small observed local overhead without demonstrated user-visible delay or production load impact. Successful login remains available. The evidence supports limited resource waste, not a performance outage.

**Severity:** L

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
