# [A11Y] Login — Placeholder text has insufficient contrast

**ID:** UI-03  
**Status:** Open  
**Category:** A11Y (Accessibility)  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081, local training stack; deployed application build unknown. Test repository revision 15f4bdb before this refactor. HeadlessChrome 152.0.0.0 via Playwright CLI on macOS, DPR 1; desktop 1920×1080, tablet 768×1024, mobile 414×896 CSS viewport; desktop browser resized, default zoom, no throttling. Demo admin used only for authenticated checks.

## Steps to reproduce

Open login with empty fields. Inspect the placeholder colors against the white input surface.

## Actual result and evidence

Both placeholders use oklch(0.704 0.04 256.788), converted by Chromium canvas to RGB(144,161,185). Contrast against white is 2.63:1 at 14 px. The composited input background is approximately white.

![Evidence](../../../exploration/ui/login-2026-09-11/mobile-initial.png)

Local evidence is ignored; the observations above remain reproducible without it.

## Expected result and basis

Use at least 4.5:1 for this normal-sized text. Basis: [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Impact assessment

Low-vision users may struggle to read placeholders. Persistent darker labels repeat their meaning, so the immediate information loss is limited.

## Severity decision

The impact described above is limited in the observed local workflow; core credential login remains usable.

**Severity:** L

## Acceptance criteria and retest

- [ ] Implement the expected behavior above.
- [ ] Repeat the original reproduction and neighboring positive case.
- [ ] Check relevant desktop/tablet/mobile and keyboard states.
- [ ] Add a focused regression after the fix; do not assert the defect as correct behavior.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Exploratory authenticated sessions were logged out. No product/user data changed. Manual DOM, screenshot and keyboard inspection; no real screen-reader or physical-device audit. Timing is local and unthrottled. No external issue published.
