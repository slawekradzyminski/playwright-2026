# [A11Y] Login and registration — Inputs omit autocomplete purpose

**ID:** UI-02  
**Status:** Open  
**Category:** A11Y (Accessibility)  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081, local training stack; deployed application build unknown. Test repository revision 15f4bdb before this refactor. HeadlessChrome 152.0.0.0 via Playwright CLI on macOS, DPR 1; desktop 1920×1080, tablet 768×1024, mobile 414×896 CSS viewport; desktop browser resized, default zoom, no throttling. Demo admin used only for authenticated checks.

## Steps to reproduce

Open login and inspect the Username and Password input attributes.

## Actual result and evidence

Neither input has autocomplete. Password has type="password"; Username has name="username". Chromium also logs a suggested current-password autocomplete hint.

![Evidence](../../../exploration/ui/login-2026-09-11/mobile-initial.png)

Local evidence is ignored; the observations above remain reproducible without it.

## Expected result and basis

Set autocomplete="username" and autocomplete="current-password". Basis: [WCAG input purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html). Browser heuristics are not an explicit purpose declaration.

Registration also reproduces missing autocomplete metadata (2026-09-11, repository `0a79eb8`, Chromium 152.0.7977.84): inspect all five inputs on `/register`; each has no `autocomplete` attribute. Extend the fix to use `username`, `email`, `new-password`, `given-name`, and `family-name` respectively. No password-manager or screen-reader behavior was tested.

## Impact assessment

Users relying on autofill and cognitive assistance receive less reliable input-purpose metadata. Actual password-manager failure was not tested; manual login remains available.

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
