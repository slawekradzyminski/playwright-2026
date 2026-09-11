# [D] POST /api/v1/users/signin — Successful response schema does not represent nullable fields correctly

**ID:** DOC-02  
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

**Reproduce:** sign in as the local demo client and compare the challenge fields with `components.schemas.LoginResponseDto.properties` in the snapshot:

```sh
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: application/json' \
  --data-binary '{"username":"client","password":"client"}'
```

Do not attach issued tokens to a bug report. The recorded response conflicts with the declared property types; no deployed consumer validation failure was recorded.

Observed non-MFA responses explicitly contain null `challengeToken` and `challengeExpiresAt`. Live OpenAPI 3.1 declares each as `type:string`, without null in the allowed type. Optional properties may be absent; optionality does not permit a present null. These actual success bodies therefore conflict with the declared property types.

Correct nullability or omit absent properties, and model normal-token versus MFA-challenge responses explicitly (for example with separate schemas and `oneOf`). Mark truly required fields per branch. The operation description currently promises tokens without explaining the conditional MFA branch. MFA fields have brief descriptions, but the branch itself is not explained at operation level. Runtime MFA behavior was not exercised, so only the observed nullability mismatch is confirmed dynamically.

## Impact assessment

The recorded normal non-MFA login response contains explicit null challenge fields, while the schema permits only strings for those properties. This is a direct type contradiction on the successful login branch, not merely missing error guidance. A consumer enforcing those declared types cannot accept that recorded response unchanged; relaxing or overriding the schema is the workaround. No deployed consumer outage or runtime MFA failure was demonstrated. The scope of actual consumer adoption remains unknown.

## Severity rationale and decision

Ordinary successful non-MFA login includes null challenge fields excluded by the declared string types. A consumer enforcing those types must override the contract to accept that response. This is a direct successful-response compatibility defect; deployed consumer adoption and authentication outage remain unverified.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: M. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Discovered during sign-in exploration on 2026-09-10. The reproduction and sanitized observations above are sufficient to investigate without the ignored scratch files. Any suspected cause above remains a hypothesis until checked against the deployed build.

## Acceptance criteria and retest

- [ ] Normal non-MFA responses conform to the schema, including challenge-field nullability.
- [ ] The conditional MFA response is described explicitly.
- [ ] Validate both branches with controlled fixtures before closing the full documentation correction.
- [ ] Link a regression test or record why verification remains manual.

**Retested on/build:** Not yet retested after a fix.  
**Retest evidence:** None; this filing adds documentation only.

## Side effects / cleanup

Successful login reproduction issues access/refresh tokens. Redact them from evidence. Do not use global logout on shared accounts; it can revoke other sessions. The original session did not change MFA or account profiles.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

A fresh disposable account login returned null challengeToken and challengeExpiresAt; the unchanged live LoginResponseDto still permits only strings. The recorded consequence is an ordinary successful response that contradicts its declared types. No production authentication outage is claimed.
