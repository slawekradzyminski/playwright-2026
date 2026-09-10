# [L][D] POST /api/v1/users/signin — Invalid-Bearer failure is missing from the sign-in contract

**ID:** DOC-03  
**Status:** Open  
**Severity:** Low — Clients cannot discover the stale/invalid Authorization-header failure from the published operation.  
**Category:** D — Documentation  
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

**Reproduce:**

```sh
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer invalid' --data-binary '{"username":"client","password":"client"}'
```

Compare the status with the sign-in `responses` map in the saved specification. Impact: integrations cannot discover this authentication-header failure from the published contract.

Correct credentials plus `Authorization: Bearer invalid` return 401 with `{"message":"Invalid or expired token"}`. Live Swagger does not list 401. Document this behavior or decide that public login should ignore stale authorization headers. Rejecting an explicitly invalid Bearer token is not by itself classified as a security defect; clients with globally attached stale tokens need a clear recovery contract.

## Impact

Clients cannot discover the stale/invalid Authorization-header failure from the published operation.

## Evidence and investigation notes

Discovered during sign-in exploration on 2026-09-10. The reproduction and sanitized observations above are sufficient to investigate without the ignored scratch files. Any suspected cause above remains a hypothesis until checked against the deployed build.

## Acceptance criteria and retest

- [ ] Document the observed 401 response and its body, or agree and implement a different invalid-header policy.
- [ ] Verify correct credentials with absent, valid, and invalid Authorization headers against that policy.
- [ ] Link a regression test or record why verification remains manual.

**Retested on/build:** Not yet retested after a fix.  
**Retest evidence:** None; this filing adds documentation only.

## Side effects / cleanup

The shown failing requests returned no login tokens. No account edits or cleanup actions were performed for this finding.
