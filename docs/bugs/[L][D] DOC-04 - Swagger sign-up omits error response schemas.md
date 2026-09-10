# [D] POST /api/v1/users/signup — Validation response bodies have no documented schema

**ID:** DOC-04
**Status:** Open
**Category:** D
**Observed on:** 2026-09-10

## Environment and preconditions

- Gateway: http://localhost:8081; deployed image: `slawekradzyminski/backend:3.7.16`.
- Public local registration with disposable users; deployed source revision and rate-limit configuration were not inspected.
- [Swagger snapshot](../exploratory-testing/openapi-2026-09-10.json) matched the live specification in the original session.

## Steps to reproduce

1. Use a fresh username and email for any duplicate-check setup.
2. POST the following body as application/json to `http://localhost:8081/api/v1/users/signup`.
3. Compare the response with the documented 400 branch.

```json
{"username":"signup-repro-unique","email":"invalid","password":"DemoPass123!","firstName":"Test","lastName":"User"}
```

## Actual result

400 with `{"email":"Email should be valid"}`. Separate duplicate checks returned `{"message":"Username is already in use"}` and `{"message":"Email is already in use"}` with 400.

## Expected result and basis

Document the 400 JSON response content, field-validation maps and duplicate-conflict message object, with examples. Keep parser status correction linked to BUG-05 and password policy correction linked to BUG-06.

## Documentation mismatch

`paths./api/v1/users/signup.post.responses.400` contains only `description: Validation failed`, without `content` or a schema. Add application/json schemas and examples for the observed supported errors.

## Impact assessment

Consumers must inspect examples or map the runtime body manually to expose detailed field feedback. The failure status is documented and the observed error bodies are readable. No generated-client failure or blocked valid registration was demonstrated. The established impact is missing integration guidance and additional implementation effort.

## Severity decision

The evidence supports incomplete error typing without demonstrated material workflow failure. Reassess if a supported consumer cannot provide required validation behavior because of the omission.

**Severity:** L

**Reassessed on:** 2026-09-10. Previous severity: M. This was a review of recorded evidence, not a new runtime or fixed-build retest.

## Evidence and investigation notes

Original exploration preceded automation. Raw requests remain in ignored `exploration/`. No backend source change was made. This report's contents were restored after a documentation edit inadvertently replaced them with register content.

## Acceptance criteria and retest

- [ ] The 400 branch documents observed field-validation and duplicate error bodies.
- [ ] Examples conform to their declared schemas.
- [ ] Parser and password-policy documentation agree with the resolution of BUG-05 and BUG-06.

**Proposed regression (not implemented):** After the documentation fix, validate representative recorded 400 bodies against their response schemas. No automated schema validator is currently configured.
**Retested on/build:** No fixed build supplied. No automated schema validation was performed.

## Side effects / cleanup

Successful exploratory duplicate-check fixtures were deleted with verified 204 responses. Invalid-email requests were rejected. No existing user accounts were deleted.
