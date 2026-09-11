# [UX] Expanded navigation — excessive visual weight and inconsistent alignment

**ID:** UI-10  
**Status:** Open  
**Category:** UX  
**Observed on:** 2026-09-11

## Environment and preconditions

- http://localhost:8081/, app build unknown; test revision c8c873feed2f163c3eb3c15b8c0c6346770642eb plus current UI test additions.
- Chromium 152.0.7977.84 on macOS, desktop context resized to 768 × 1024 and 414 × 896 CSS pixels; default DPR/zoom/cache, no throttling or touch emulation.
- Authenticated disposable client, displayed name Mobile Explorer, mobile navigation expanded.
- Evidence comes from the preceding live exploration and the user's supplied screenshot. The user explicitly requested this visual/UX issue be recorded; it is an accepted design concern, not an invented functional requirement.

## Steps to reproduce

1. Sign in and open Home at 768 × 1024.
2. Expand the hamburger navigation.
3. Compare the navigation rows, account section and main-content hierarchy. Repeat at 414 × 896.

## Actual result and evidence

The expanded menu extends from approximately y=80 to y=551 at tablet size (471 px), placing the start of the Home panel around y=577. The broad rows contain substantial empty space. A separate rounded account card with a prominent shadow gives Cart, the account name and Logout disproportionate visual weight. Logout is centered, whereas the other navigation entries are left-aligned.

These observations support a visual hierarchy and density concern. Height alone does not establish a defect: the menu has eight usable entries and must preserve comfortable touch targets. No blocked navigation, clipping within the menu, or measured increase in task time was demonstrated.

![Expanded tablet navigation](../../../exploration/ui/mobile-menu-2026-09-11/open-tablet.png)

The account card and mixed alignment are visible here and in the user-supplied image. The 414 px screenshot from the same exploration also shows the account card and centered Logout.

## Expected result and basis

The user accepted the concern after reviewing this screenshot and requested a bug report. Navigation should have a coherent alignment and visual hierarchy without an unnecessarily prominent account container. Proposed direction: a simple list with consistent left alignment and a modest divider before account actions, retaining comfortable activation areas. Exact spacing and styling remain implementation/design choices; no pixel-height limit is prescribed.

The username-only profile label and duplicate Cart entry are secondary design considerations, not independently proven defects or mandatory removals. In particular, a text Cart link can aid discoverability of the icon shortcut.

## Impact assessment

Mobile/tablet users encounter an unnecessarily heavy navigation presentation that competes with page content and breaks the alignment used by neighboring actions. The user reports that many customers use mobile devices, placing this customer-facing navigation issue on a broadly used access path. That exposure is product context supplied by the user; no traffic percentage was independently measured. Links, menu closing and logout worked in live exploration; no core task was blocked.

## Severity rationale and decision

The oversized account container and mixed alignment affect customer-facing primary navigation. The user reports substantial mobile usage, so this visible quality issue affects a broadly used customer experience rather than an isolated secondary state. Combining the observed design impairment with that product exposure supports treating it as a material UX issue. Navigation and logout remain functional; no task-time increase, conversion loss or measured traffic share is claimed.

**Severity:** M

**Severity reviewed on:** 2026-09-11, incorporating the user’s customer-exposure context and explicit classification decision. Changed from L to M. No new live reproduction or fixed-build verification was performed.

## Acceptance criteria and retest

- [ ] Navigation and account actions use a coherent alignment, including Logout.
- [ ] Account grouping has a visual weight appropriate to navigation rather than a prominent content card.
- [ ] Review spacing/density at 414 × 896 and 768 × 1024 while retaining comfortable touch targets and readable labels; obtain design acceptance of the result.
- [ ] All destinations, closing, keyboard access and logout continue working; short-viewport scrolling remains usable.
- [ ] Desktop navigation remains intact at 1920 × 1080.
- [ ] Use manual visual review for acceptance; do not turn subjective spacing preferences into arbitrary automated thresholds.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

No new account or browser session was created for this report. Prior exploration account deletion returned 204 and the browser was closed. No real-device usability study, task-time measurement or new live retest was performed. UI-08 (Home clipping) and UI-09 (missing toggle state) remain separate defects.
