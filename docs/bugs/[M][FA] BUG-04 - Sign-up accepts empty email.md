# [FA] POST /api/v1/users/signup — Empty email addresses create accounts

**ID:** BUG-04
**Status:** Open
**Category:** FA
**Observed on:** 2026-09-10

## Environment and preconditions

- Gateway: http://localhost:8081; deployed image: `slawekradzyminski/backend:3.7.16`; gateway image: `nginx:1.31.3-trixie`.
- Public local registration; fresh disposable users. Role-injection follow-up returned only ROLE_CLIENT; normal signup login had no MFA challenge.
- Effective rate-limit configuration and deployed source revision were not inspected.
- [Swagger snapshot](../exploratory-testing/openapi-2026-09-10.json) matches the live specification captured in this session exactly.

## Steps to reproduce

1. Use a fresh username and email for each attempt. For the empty-email case, ensure no earlier disposable account owns the empty email.
2. POST the following body as application/json to `http://localhost:8081/api/v1/users/signup`.
3. Inspect status and response body. Angle-bracket values below mean expand the described string before sending.

```json
{"username":"signup-repro-unique","email":"","password":"DemoPass123!","firstName":"Test","lastName":"User"}
```

## Actual result

201 with an empty response body. Reproduced twice using fresh usernames and deleting the first account before repeating.

## Expected result and basis

Return 400 with a field-specific email validation error. UserRegisterDto.email declares format=email and requires the property; an empty string is not an email address.

## Impact assessment

A fresh registration with an empty email creates a persisted account, as confirmed by successful account deletion during cleanup. This is an account-data validation failure: the account has no usable email address despite the declared email contract. Supplying a valid email avoids the issue for new registrations, but does not prevent the service from accepting invalid account data. Password recovery and verification failures are plausible downstream effects; neither was exercised, and no privilege escalation or account takeover was demonstrated.

## Severity decision

Medium is retained because an invalid value crosses the registration boundary and creates account state, exceeding a feedback-only defect. High is not supported by the current evidence. Reassess if the intended email requirement changes or downstream security impact is reproduced.

**Severity:** M

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: M. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Exploration preceded automation. Raw requests and scratch drivers remain in ignored `exploration/`. No backend source change was made. Runtime observations do not establish that any particular source revision is deployed.

## Acceptance criteria and retest

- [ ] Reproduction satisfies the expected result above.
- [ ] Valid registration and adjacent boundary checks continue to work.
- [ ] Swagger describes the agreed behavior accurately.

**Proposed regression (not implemented):** After the fix, add a backend validation test: given an empty email and otherwise valid registration data, when validation runs, then reject the email. Consider one API regression asserting 400 and an email error if endpoint coverage is needed; ensure no account remains if the defect recurs. The expected-failure API test was removed to keep the active suite focused on supported behavior.
**Retested on/build:** No fixed build supplied; automated checks reproduced the functional findings on the image above.

## Side effects / cleanup

Successful exploratory accounts were deleted with the administrator-only DELETE /api/v1/users/{username} endpoint, checking 204. Automated sign-up fixtures also delete only accounts created by their own test, including unexpected successful registrations. No existing user accounts were deleted.
