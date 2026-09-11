# [A11Y] Login — Input focus ring has insufficient contrast

**ID:** UI-04  
**Status:** Open  
**Category:** A11Y (Accessibility)  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081, local training stack; deployed application build unknown. Test repository revision 15f4bdb before this refactor. HeadlessChrome 152.0.0.0 via Playwright CLI on macOS, DPR 1; desktop 1920×1080, tablet 768×1024, mobile 414×896 CSS viewport; desktop browser resized, default zoom, no throttling. Demo admin used only for authenticated checks.

## Steps to reproduce

Open login, use Tab to focus Username and then Password.

## Actual result and evidence

The author-defined 2 px focus ring is oklch(0.869 0.022 252.894), RGB(202,213,226), approximately 1.49:1 against white. The native outline is suppressed. The focused input screenshot shows a very pale ring.

![Evidence](../../../exploration/ui/login-2026-09-11/mobile-focus.png)

Local evidence is ignored; the observations above remain reproducible without it.

## Expected result and basis

Provide a focus indicator with at least 3:1 against adjacent colors. Basis: [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Impact assessment

Keyboard users with low vision have difficulty identifying the active credential field. Tab order works and a visual ring exists, but its contrast is substantially below the target.

## Severity decision

The impact described above is a material accessibility impairment; core credential login remains usable.

**Severity:** M

## Acceptance criteria and retest

- [ ] Implement the expected behavior above.
- [ ] Repeat the original reproduction and neighboring positive case.
- [ ] Check relevant desktop/tablet/mobile and keyboard states.
- [ ] Add a focused regression after the fix; do not assert the defect as correct behavior.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Exploratory authenticated sessions were logged out. No product/user data changed. Manual DOM, screenshot and keyboard inspection; no real screen-reader or physical-device audit. Timing is local and unthrottled. No external issue published.
