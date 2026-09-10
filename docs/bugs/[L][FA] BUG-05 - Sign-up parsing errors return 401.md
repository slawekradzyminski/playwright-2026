# [FA] POST /api/v1/users/signup — Malformed JSON is reported as unauthorized

**ID:** BUG-05
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
{
```

## Actual result

401 with {"message":"Unauthorized"}; reproduced twice. An array body [] also returned 401 once.

## Expected result and basis

Return 400 for malformed JSON. The public signup operation has no authentication requirement; malformed syntax is a client request error, not an authentication failure. This follows HTTP status semantics and the documented validation-failure branch.

## Impact assessment

Clients sending malformed JSON receive 401 instead of a bad-request response. The recorded malformed requests are rejected, and valid registration works. Correcting the JSON is a practical workaround. No account creation from malformed input, authentication bypass, client retry loop, or disruption to a valid registration was demonstrated. The confirmed consequence is misleading error classification.

## Severity decision

Low replaces Medium on the same impact basis as BUG-01. A demonstrated failure in a supported client recovery flow would justify reassessment; the status mismatch alone does not establish that impact.

**Severity:** L

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: M. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Exploration preceded automation. Raw requests and scratch drivers remain in ignored `exploration/`. No backend source change was made. Runtime observations do not establish that any particular source revision is deployed.

## Acceptance criteria and retest

- [ ] Reproduction satisfies the expected result above.
- [ ] Valid registration and adjacent boundary checks continue to work.
- [ ] Swagger describes the agreed behavior accurately.

**Proposed regression (not implemented):** After the fix, add an API regression: given malformed JSON, when POST /api/v1/users/signup is called, then return 400 rather than 401. This belongs at the HTTP layer because it checks parser/error-handler integration. The expected-failure API test was removed to keep the active suite focused on supported behavior.
**Retested on/build:** No fixed build supplied; automated checks reproduced the functional findings on the image above.

## Side effects / cleanup

Successful exploratory accounts were deleted with the administrator-only DELETE /api/v1/users/{username} endpoint, checking 204. Automated sign-up fixtures also delete only accounts created by their own test, including unexpected successful registrations. No existing user accounts were deleted.
