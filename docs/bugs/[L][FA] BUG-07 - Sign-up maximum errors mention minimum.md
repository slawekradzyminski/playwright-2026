# [FA] POST /api/v1/users/signup — Maximum-length violations describe the minimum

**ID:** BUG-07
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
{"username":"signup-repro-unique","email":"signup-repro-unique@example.com","password":"DemoPass123!","firstName":"<256 ASCII x characters>","lastName":"User"}
```

## Actual result

400 with {"firstName":"Minimum firstName length: 4 characters"}; reproduced twice. Username, password and lastName at 256 characters also returned their minimum-length messages.

## Expected result and basis

Keep 400, but explain that the maximum is 255 characters. The schema explicitly declares maxLength=255. Exact phrasing is proposed; the regression checks maximum and 255 rather than a complete sentence.

## Impact assessment

Callers exceeding a sign-up field maximum receive a minimum-length message. The API still rejects the request with 400; consulting the documented maximum and shortening the field resolves it. This finding does not demonstrate incorrect acceptance, persisted invalid data, or failure of valid registration. Its consequence is confusing validation feedback.

## Severity decision

Low is retained for the same reason as BUG-03: the enforced boundary is correct and the message is misleading.

**Severity:** L

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: L. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Exploration preceded automation. Raw requests and scratch drivers remain in ignored `exploration/`. No backend source change was made. Runtime observations do not establish that any particular source revision is deployed.

## Acceptance criteria and retest

- [ ] Reproduction satisfies the expected result above.
- [ ] Valid registration and adjacent boundary checks continue to work.
- [ ] Swagger describes the agreed behavior accurately.

**Proposed regression (not implemented):** After the fix, add backend validation tests: given each field above its maximum, when validation runs, then return an error identifying the maximum of 255. Keep this message/boundary matrix outside the API suite. The expected-failure API test was removed to keep the active suite focused on supported behavior.
**Retested on/build:** No fixed build supplied; automated checks reproduced the functional findings on the image above.

## Side effects / cleanup

Successful exploratory accounts were deleted with the administrator-only DELETE /api/v1/users/{username} endpoint, checking 204. Automated sign-up fixtures also delete only accounts created by their own test, including unexpected successful registrations. No existing user accounts were deleted.
