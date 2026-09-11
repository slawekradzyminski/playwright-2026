# [FA] POST /api/v1/users/signin — Required login credentials lack presence validation

**ID:** BUG-02  
**Status:** Needs clarification
**Category:** FA — Functional API  
**Observed on:** 2026-09-10

## Environment and preconditions

- Base URL: `http://localhost:8081`; deployed image: `slawekradzyminski/backend:3.7.16`; profile: `local`.
- Local demo accounts; tested client account had MFA disabled. Commands using `client/client` assume that documented local fixture.
- [Swagger UI](http://localhost:8081/swagger-ui/index.html) · [session OpenAPI snapshot](../../exploratory-testing/openapi-2026-09-10.json).
- Source reviewed: `8cb264a24ef997d635210bc5d0152363f78f8486` in the backend repository. Deployed source revision is unverified; source and live specification differ.

## Reproduction, actual result, and expected result

1. Start the local stack with the environment above.
2. Execute the reproduction below; for documentation defects, compare the indicated schema with the response.
3. Inspect the status/body and compare with the stated expectation. The recorded result is from the original session, not a new retest.

```sh
curl -i http://localhost:8081/api/v1/users/signin \
  -H 'Content-Type: application/json' --data-binary '{}'
```

Actual: 422 generic credentials error. Omitting either field or explicitly setting either/both to null has the same outcome. Empty strings instead produce field validation errors.

Expected: consistent 400 field validation for missing/null credentials. This is a proposed input-validation change requiring agreement; no authentication bypass was observed and no token was issued. The source DTO only has `@Size`, with no presence constraint. Swagger also omits `required`, so this requires coordinated implementation and contract correction rather than treating it as a direct violation of an existing required-field declaration. Decide separately whether whitespace-only passwords should be rejected; do not trim passwords automatically.

## Impact assessment

Missing or null credentials receive a generic authentication failure instead of field-specific feedback. No token is issued, and valid credentials still work. Supplying credentials is the normal recovery path. Swagger does not require the fields, and the proposed distinction between missing credentials and incorrect credentials has not been agreed. The evidence therefore establishes inconsistent feedback, not an authentication bypass or a confirmed violation of an agreed presence-validation requirement.

## Severity rationale and decision

Missing credentials produce generic rejection without issuing tokens. Field-specific presence validation is not an agreed requirement, and supplying credentials recovers the flow. Only feedback ambiguity is established; the classification remains provisional pending that policy decision.

**Severity:** L (provisional)

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: M. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Discovered during sign-in exploration on 2026-09-10. The reproduction and sanitized observations above are sufficient to investigate without the ignored scratch files. Any suspected cause above remains a hypothesis until checked against the deployed build.

## Acceptance criteria and retest

- [ ] Agree and document the missing/null credential policy.
- [ ] Missing or null credentials return field validation errors with 400 under the proposed policy.
- [ ] Correct credentials still succeed; incorrect nonempty credentials retain the agreed authentication response.
- [ ] Link a regression test or record why verification remains manual.

**Retested on/build:** Not yet retested after a fix.  
**Retest evidence:** None; this filing adds documentation only.

## Side effects / cleanup

The shown failing requests returned no login tokens. No account edits or cleanup actions were performed for this finding.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

An empty object still returned 422 with Invalid username/password supplied and no tokens. The live schema still does not require the credential fields. The credential policy remains unresolved; this is not an authentication bypass.
