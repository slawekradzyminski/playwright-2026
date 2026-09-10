# [M][FA] POST /api/v1/users/signin — Required login credentials lack presence validation

**ID:** BUG-02  
**Status:** Open  
**Severity:** Medium — Absent credentials are not distinguished from failed authentication, making validation inconsistent. The proposed presence requirement needs agreement.  
**Category:** FA — Functional API  
**Observed on:** 2026-09-10

## Environment and preconditions

- Base URL: `http://localhost:8081`; deployed image: `slawekradzyminski/backend:3.7.16`; profile: `local`.
- Local demo accounts; tested client account had MFA disabled. Commands using `client/client` assume that documented local fixture.
- [Swagger UI](http://localhost:8081/swagger-ui/index.html) · [session OpenAPI snapshot](../exploratory-testing/openapi-2026-09-10.json).
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

Expected: consistent 400 field validation for missing/null credentials. This is an input-validation defect, not an authentication bypass: no token was issued. The source DTO only has `@Size`, with no presence constraint. Swagger also omits `required`, so this requires coordinated implementation and contract correction rather than treating it as a direct violation of an existing required-field declaration. Decide separately whether whitespace-only passwords should be rejected; do not trim passwords automatically.

## Impact

Absent credentials are not distinguished from failed authentication, making validation inconsistent. The proposed presence requirement needs agreement.

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
