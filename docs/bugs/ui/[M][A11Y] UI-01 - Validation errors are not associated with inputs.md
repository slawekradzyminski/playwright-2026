# [A11Y] Login — Validation errors are not associated with inputs

**ID:** UI-01  
**Status:** Open  
**Category:** A11Y (Accessibility)  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081, local training stack; deployed application build unknown. Test repository revision 15f4bdb before this refactor. HeadlessChrome 152.0.0.0 via Playwright CLI on macOS, DPR 1; desktop 1920×1080, tablet 768×1024, mobile 414×896 CSS viewport; desktop browser resized, default zoom, no throttling. Demo admin used only for authenticated checks.

## Steps to reproduce

Open login and submit both fields empty. Refocus Username, then Password.

## Actual result and evidence

Both visible error paragraphs have role="alert" and test IDs login-username-error/login-password-error, but no id. Inputs have no aria-invalid, aria-describedby or aria-errormessage. Reproduced at all three viewport sizes. Focus correctly moves to Username; live alerts exist.

![Evidence](../../../exploration/ui/login-2026-09-11/mobile-empty.png)

Local evidence is ignored; the observations above remain reproducible without it.

## Expected result and basis

Expose invalid state and associate each field with its own error; preserve the working live announcements and focus behavior. This is a programmatic form-feedback improvement, not a claim that no error is announced.

## Impact assessment

Assistive-technology users returning to a field cannot retrieve its error through the field description or invalid state. Visual users can read adjacent messages; the login happy path works.

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
