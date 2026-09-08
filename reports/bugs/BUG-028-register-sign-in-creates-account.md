# BUG-028: Registration Sign in button creates an account

## Classification

- Type: Functional
- Status: Open
- Severity (proposed): Medium — a navigation action persists an account the user did not choose to create.

## Endpoint

UI `/register`, `register-login-link`; unexpected `POST /api/v1/users/signup`.

## Environment

- Observed on: 2026-09-08
- Base URL: http://localhost:8081
- Browser: Chromium 152, macOS, 1440 × 900
- Application version: deployed commit not exposed. Local frontend reference: `41e177a6e4b4f53ffb75d0e37b0666dcb9508277`.
- Identity: anonymous

## Preconditions

Use a unique disposable username/email and valid registration values. No account needs to be created in setup.

## Reproduction

1. Open `/register`.
2. Fill Username with a unique value (observed: `explore.reg.0908.signin`), Email with the matching `@example.test` address, a disposable password of at least eight characters, First Name `Test`, Last Name `User`.
3. Click **Sign in** beneath “Already have an account?”, without clicking **Create account**.
4. Observe network requests. Authenticate through the existing LoginClient using these same credentials to verify persistence.

## Expected

Navigate to `/login` without submitting registration or creating an account. This expectation follows the control's **Sign in** label, its surrounding text and its frontend navigation handler.

## Actual

The page navigates to `/login` but also sends a signup POST. A subsequent LoginClient signin returned **200**, confirming the unintended account exists.

## Evidence

Observed three times with valid unique values; replay captured signup 201 in [sanitized browser events](../exploration/ui/2026-09-08-registration-1339/browser-events.json). an empty-form Sign in click navigated normally. DOM inspection reports `register-login-link` as `type="submit"`. In local `src/pages/auth/registerPage.tsx`, the navigation Button is inside the form and omits `type="button"`; the shared Button component supplies no default type.

[Local exploration index](../exploration/ui/2026-09-08-registration-1339/review.md). Screenshots in that directory are ignored and available only in the originating workspace. Network and persistence evidence is recorded above; a screenshot alone does not prove account creation.

Before clicking **Sign in** (valid disposable form):

![Valid registration form before clicking Sign in](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-08-registration-1339/screenshots/bug028-before-signin.png)

After clicking **Sign in**: login page shows registration success; the observed signup response was 201.

![Registration success after clicking Sign in](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-08-registration-1339/screenshots/bug028-after-signin.png)

## Impact

Users who fill the form and switch to login accidentally create an account and reserve the supplied username/email.

## Cleanup

All three disposable reproduction accounts were deleted through `deleteUserAsAdmin`; cleanup completed successfully.

## Follow-up and automation

Set the navigation control's type to `button` (or use a link), then verify both empty and valid-filled forms navigate without signup requests. The application source is outside this test change. Exclude this known defective filled-form scenario from automated tests until fixed; do not encode account creation as expected behavior or add an expected failure.
