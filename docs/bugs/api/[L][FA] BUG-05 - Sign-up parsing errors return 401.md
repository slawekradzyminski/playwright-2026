# [FA] POST /api/v1/users/signup — Malformed JSON is reported as unauthorized

**ID:** BUG-05
**Status:** Open
**Category:** FA
**Observed on:** 2026-09-10

## Environment and preconditions

- Gateway: http://localhost:8081; deployed image: `slawekradzyminski/backend:3.7.16`; gateway image: `nginx:1.31.3-trixie`.
- Public local registration; fresh disposable users. Role-injection follow-up returned only ROLE_CLIENT; normal signup login had no MFA challenge.
- Effective rate-limit configuration and deployed source revision were not inspected.
- [Swagger snapshot](../../exploratory-testing/openapi-2026-09-10.json) matches the live specification captured in this session exactly.

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

## Severity rationale and decision

Malformed registration requests are rejected and valid registration remains available. The wrong authentication status misleads diagnosis, but no unintended account, bypass or broken client recovery flow was demonstrated. Repairing the JSON is the available workaround.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

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

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Malformed sign-up JSON still returned 401 with Unauthorized. Valid registration remains available; the observed issue is misleading request-error classification. Shared cause with BUG-01 is plausible but unverified.
