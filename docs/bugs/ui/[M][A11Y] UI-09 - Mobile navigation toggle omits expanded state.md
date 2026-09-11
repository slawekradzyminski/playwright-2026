# [A11Y] Mobile navigation — toggle omits expanded state

**ID:** UI-09  
**Status:** Open  
**Category:** A11Y  
**Observed on:** 2026-09-11

## Environment and preconditions

- http://localhost:8081/, app build unknown; test revision c8c873feed2f163c3eb3c15b8c0c6346770642eb with current UI test additions.
- Chromium 152.0.7977.84, macOS, resized desktop context at 414 × 896 CSS pixels; default DPR/zoom/cache, no throttling or touch emulation.
- Disposable ROLE_CLIENT account, displayed name Mobile Explorer. The authenticated header uses a collapsible menu; the guest header instead exposes Login/Register directly.

## Steps to reproduce

1. Sign in and open Home at mobile width.
2. Focus the button named “Open main menu” and activate it.
3. Inspect its accessible name and `aria-expanded`; close and reopen using Enter/Space.

## Actual result and evidence

`mobile-menu-toggle` remains named “Open main menu” while its icon changes to a close symbol. `aria-expanded` is absent in the initial expanded state, after closing with Enter, and after reopening with Space. The controlled menu is respectively visible, hidden, then visible. No `aria-controls` is present either, but that optional attribute is not the basis of this finding.

Tab moves from the expanded toggle to Products, and navigation links and logout function. Thus the confirmed defect concerns missing programmatic state and misleading toggle text, not total keyboard inoperability.

![Expanded mobile menu](../../../exploration/ui/mobile-menu-2026-09-11/open-mobile.png)

The screenshot shows the close icon and expanded links; DOM inspection establishes the missing state independently of the visual appearance.

## Expected result and basis

Expose `aria-expanded=true` when the controlled content is visible and `false` when hidden, as described by the [W3C disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). Use either a stable descriptive name such as “Main menu” with the state, or an action name that reflects opening/closing. `aria-controls` may additionally identify the controlled region.

## Impact assessment

Users relying on programmatic button state cannot determine whether navigation is expanded from the control, and its persistent opening instruction contradicts the close action. This impairs discovery and orientation in primary navigation; keyboard activation and ordinary visual navigation remain usable. No real screen-reader session was performed, so exact announcements are not claimed.

## Severity rationale and decision

The primary navigation toggle omits its expanded state and retains an opening instruction while it closes the menu. This materially impairs programmatic orientation, even though Enter/Space and links work. Exact screen-reader announcements and complete keyboard blockage were not demonstrated.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Acceptance criteria and retest

- [ ] Toggle exposes false/true/false across closed/open/closed states.
- [ ] Accessible name is descriptive and does not contradict the current action.
- [ ] Enter/Space activation and tab access to links continue working.
- [ ] Navigation selection and logout close the menu and reach their destinations.
- [ ] Check mobile/tablet layouts and screen-reader state announcements. Desktop-only regression policy remains unchanged; proposed mobile regression awaits the fix and an agreed automation scope.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Disposable account deleted through the API after UI logout. No injected failures. Escape did not close the menu; this nonmodal disclosure behavior is not filed as a separate defect without an applicable requirement. Responsive desktop inspection does not establish real-device or screen-reader correctness.
