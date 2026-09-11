# [FA] POST /api/v1/users/signup — Documented valid passwords fail above 72 bytes

**ID:** BUG-06
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
{"username":"signup-repro-unique","email":"signup-repro-unique@example.com","password":"<255 ASCII x characters>","firstName":"Test","lastName":"User"}
```

## Actual result

400 with {"error":"password cannot be more than 72 bytes"} for 255 ASCII characters. Follow-up: 72 ASCII bytes returned 201; 73 ASCII bytes and 37 copies of ą (74 UTF-8 bytes) returned the same 400 error.

## Expected result and basis

UserRegisterDto.password declares minLength=8 and maxLength=255. A unique otherwise valid request with 255 ASCII password characters should return 201 under this contract. Resolve by safely supporting the documented range, or explicitly agreeing and documenting a byte-aware limit and consistent field validation. Never silently truncate passwords.

## Impact assessment

An otherwise valid registration fails for passwords within the documented character range when their UTF-8 encoding exceeds 72 bytes. The session confirmed rejection at 73 ASCII bytes and 74 bytes of Unicode, while 72 ASCII bytes succeeded. Affected users must choose another password or cannot complete registration with their chosen contract-valid value. This is a blocked valid-input branch of the core flow; ordinary shorter-password registration still works. No silent truncation, weakened stored password, or authentication bypass was demonstrated.

## Severity rationale and decision

Passwords within the published character range are rejected above the observed byte boundary, preventing registration with those chosen values. Choosing another password permits registration, but changes valid user input. This disrupts a supported branch of account creation without demonstrating a general outage, truncation or bypass.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: M. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Exploration preceded automation. Raw requests and scratch drivers remain in ignored `exploration/`. No backend source change was made. Runtime observations do not establish that any particular source revision is deployed.

## Acceptance criteria and retest

- [ ] Reproduction satisfies the expected result above.
- [ ] Valid registration and adjacent boundary checks continue to work.
- [ ] Swagger describes the agreed behavior accurately.

**Proposed regression (not implemented):** After agreeing and implementing the password policy, add backend validation/service tests for the accepted maximum and UTF-8 byte boundaries. Under the current contract, 255 ASCII characters must be supported. Update the expectations if the contract is explicitly changed; do not reproduce the full boundary matrix in the API suite. The expected-failure API test was removed to keep the active suite focused on supported behavior.
**Retested on/build:** No fixed build supplied; automated checks reproduced the functional findings on the image above.

## Side effects / cleanup

Successful exploratory accounts were deleted with the administrator-only DELETE /api/v1/users/{username} endpoint, checking 204. Automated sign-up fixtures also delete only accounts created by their own test, including unexpected successful registrations. No existing user accounts were deleted.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Fresh registrations accepted 72 ASCII bytes, rejected 73 ASCII bytes, rejected 37 copies of ą (74 UTF-8 bytes), and rejected 255 ASCII characters with password cannot be more than 72 bytes. The live schema still advertises maxLength 255. The accepted account was deleted with 204. Production consequences remain bounded; silent truncation and authentication bypass were not demonstrated.
