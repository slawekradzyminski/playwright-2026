# [D] POST /api/v1/users/signin — Invalid-Bearer failure is missing from the sign-in contract

**ID:** DOC-03  
**Status:** Open
**Category:** D — Documentation  
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

**Reproduce:**

```sh
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer invalid' --data-binary '{"username":"client","password":"client"}'
```

Compare the status with the sign-in `responses` map in the saved specification. Impact: integrations cannot discover this authentication-header failure from the published contract.

Correct credentials plus `Authorization: Bearer invalid` return 401 with `{"message":"Invalid or expired token"}`. Live Swagger does not list 401. Document this behavior or decide that public login should ignore stale authorization headers. Rejecting an explicitly invalid Bearer token is not by itself classified as a security defect; clients with globally attached stale tokens need a clear recovery contract.

## Impact assessment

A request carrying an invalid Bearer header receives a 401 branch omitted from the login documentation. The recorded behavior affects callers that attach that header; login without it remains the available path. Removing a stale header is a practical workaround. No recovery loop or inability to log in after removing the header was demonstrated. Whether public login should ignore such headers is a separate policy decision; the confirmed defect is incomplete documentation.

## Severity rationale and decision

The omitted response affects login requests carrying an invalid Bearer header. Removing that header permits the normal login path, and no unrecoverable client loop was demonstrated. The confirmed consequence is incomplete conditional-error guidance.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: L. This reassessment does not mark the defect fixed.

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

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

A sign-in request carrying a malformed bearer value returned 401 with Invalid or expired token. The unchanged operation still omits that response. Omitting stale credentials is the workaround.
