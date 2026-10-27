# BUG-0015: Login and registration validation errors are not associated with their inputs

| Jira field / metadata | Value |
| --- | --- |
| Summary | [UI] Login and registration fields lack programmatic invalid state and error association |
| Issue Type | Bug |
| Priority | To be determined |
| Component/s | Login, registration, accessibility |
| Labels | ui, accessibility, login, registration |
| Environment | Local gateway `http://localhost:8081`, frontend image 3.9.1 |
| Browser / viewport | Playwright Chromium, 402 × 874 CSS px; errors also observed at other sampled sizes |
| Source revision | Runtime image revision not established; local source checkout `7392a3a` inspected separately |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | — |

## Description

Submitting the empty login form shows individual error messages, but neither
input exposes an invalid state or a programmatic relationship to its message.
A user returning to a field with assistive technology may not be able to identify
its current error from the field. The messages themselves have `role="alert"`,
so they can be announced when inserted; screen-reader behavior was not tested.
Fields should expose their invalid state and associated error so it remains
available when revisiting them.

## Steps to reproduce

1. Open `/login` and submit the form with both fields empty.
2. Inspect the username and password inputs and their visible validation messages.

## Expected result

Each invalid field exposes its invalid state and is programmatically associated
with its corresponding error message. The association and invalid state update
when the error is corrected.

## Actual result

The page displays “Username is required” and “Password is required”, but the
corresponding inputs have no `aria-invalid`, `aria-describedby` or
`aria-errormessage` attributes; they also have no native `required` attribute.

## Evidence

Chromium DOM inspection after submission showed that neither input had
`aria-invalid`, `aria-describedby`, `aria-errormessage`, or `required`:

```html
<input data-testid="login-username-input" id="username" name="username">
<input data-testid="login-password-input" id="password" type="password" name="password">
```

These excerpts omit styling and placeholder attributes. Both error elements were visible. The same empty-field messages were
observed at 402 × 874, 360 × 800, 820 × 1180, 1180 × 820 and 1920 × 1080.
No screen reader or real-device test was performed.

## Root cause

Unknown for the deployed image. In the separately inspected local frontend source,
`loginPage.tsx` renders alert paragraphs without an ID or input association, and
`components/ui/input.tsx` uses the `error` prop for styling only. The source
checkout has not been verified as the image's exact revision.

## Suggested fix

Give each error a stable ID and connect the relevant input to it, exposing the
invalid state while the error is present.

## Acceptance criteria

- Each invalid field exposes its invalid state and corresponding message to assistive technology.
- Correcting the value clears or updates the state and association appropriately.
- Cover the behavior with an appropriate regression check and verify with a screen reader.

## Registration scope confirmed on 2026-10-27

The same defect also affects all five registration inputs. At `/register`, submit
an empty form: Username, Email, Password, First Name and Last Name each display a
required-field alert, but all five inputs lack `aria-invalid`, `aria-describedby`
and `aria-errormessage`. Their visible alerts have no IDs. Labels work, and focus
moves to Username, but revisiting a field cannot expose its associated error.
This extends the existing report rather than introducing a duplicate root cause.

Verified in Chromium 156.0.8078.48 at 1920 × 1080, 402 × 874, 820 × 1180 and
1180 × 820, with touch emulation for phone/tablet. Frontend image remains 3.9.1;
inspected frontend revision is `7392a3a935b373f3160c5a3ae4162c5b2f310624`, with
runtime revision match unknown. `registerPage.tsx` and the shared Input have the
same missing association pattern described above. Correcting Username clears
its visible error; assistive-technology testing was not performed.

Acceptance criteria above apply to registration as well as login.
