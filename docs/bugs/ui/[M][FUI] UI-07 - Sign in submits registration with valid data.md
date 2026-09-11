# [FUI] Registration — Sign in creates an account

**ID:** UI-07  
**Status:** Open  
**Category:** FUI  
**Observed on:** 2026-09-11

## Environment and preconditions

http://localhost:8081/register; app build unknown; test revision `0a79eb8` with working changes. Playwright CLI Chromium on macOS, desktop 1920 × 1080, default zoom and no configured throttling. Logged out; unique fake registration data. Live backend, no request mocks.

## Steps to reproduce

1. Open `/register` while logged out.
2. Fill all five fields with valid, unique fake account details.
3. Click **Sign in** below the form, not **Create account** or the header Login link.
4. Inspect HTTP traffic through completion and look up the generated username through the admin user-read API.

## Actual result and evidence

The browser reaches `/login`, but registration is submitted and the account exists. Reproduced twice with separate usernames.

| Action / form state | Signup traffic | Destination | Backend verification |
|---|---|---|---|
| Form Sign in / valid, attempt 1 | Request 12: POST `/api/v1/users/signup`, 201 | `/login` | GET user: 200 |
| Form Sign in / empty | No additional signup request | `/login` | Not applicable |
| Form Sign in / valid, attempt 2 | Request 37: POST `/api/v1/users/signup`, 201 | `/login` | GET user: 200 |
| Header Login / valid | No additional signup request | `/login` | GET user: 404 |
| Form Sign in / partial | No additional signup request | `/login` | Not checked |

Header and partial controls were observed for 1500 ms after navigation; zero counts are bounded observations. Empty-form traffic was inspected immediately after navigation and again in the subsequent cumulative log. Positive signup requests completed with 201. Per-request durations were not collected.

DOM evidence for `register-login-link`: `tagName=BUTTON`, `getAttribute('type')=null`, effective `type=submit`, `form != null`. This is consistent with a secondary button triggering form submission; application source was not inspected. Empty/invalid data can mask the unintended submission by failing validation.

Sanitized local evidence: `exploration/ui/register-navigation-2026-09-11/`: `valid-sign-in-requests.txt`, `after-empty-requests.txt`, `after-repeat-requests.txt`, `after-header-requests.txt`, `after-partial-requests.txt`, `backend-verification.json`, and `action-ledger.json`. Essential facts are preserved above because scratch files are ignored.

## Expected result and basis

Sign in navigates to login without sending signup or creating an account. Its label and placement present an alternative for existing users. The navigation button should not submit the registration form; inspect an explicit `type="button"` or a navigation link as a potential fix.

## Impact assessment

Users leaving a populated registration form can accidentally create an account and transmit registration data despite intending only to navigate. The correct destination masks the side effect. The header Login link avoided the mutation in the observed control. No production data or external email delivery was investigated.

## Severity decision

**Severity:** M. Confirmed unintended persistent account creation, with normal registration and a navigation workaround available in this training environment.

## Acceptance criteria and retest

- [ ] Form Sign in navigates from empty, partial/invalid and valid unsaved data without signup traffic or account creation.
- [ ] Verify the same action by keyboard activation and relevant responsive layouts.
- [ ] Create account still creates exactly one account; header Login still navigates without registration.
- [ ] Extend the existing navigation regression with valid disposable data, a request observer installed before the click, destination verification and absence of unintended signup/account creation. Do not bless current behavior or add an expected-failure test by default.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Both accidentally created accounts were verified through API, deleted with 204 and rechecked as 404. The valid header-control account did not exist (404). CLI listener-based capture attempts closed unexpectedly; reproduction used CLI request snapshots instead. A delayed toast inspection timed out and is not used as evidence. No application code or automated tests were changed for this investigation; no mobile, real-device, or screen-reader retest was performed. No external issue published.
