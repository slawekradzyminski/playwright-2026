# [M][FA] POST /api/v1/users/signin — Request/protocol errors are reported as unauthorized

**ID:** BUG-01  
**Status:** Open  
**Severity:** Medium — Clients receive an authentication error for invalid requests and cannot choose the correct recovery action.  
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

Reproduction:

```sh
curl -i http://localhost:8081/api/v1/users/signin \
  -H 'Content-Type: application/json' --data-binary '{"username":'
```

Actual: `401 {"message":"Unauthorized"}`. Same outcome for an empty body, JSON `null`, a root array, object-valued username, array-valued password, unsupported request media type and unsupported response media type. Malformed JSON was reproduced again; malformed JSON and media negotiation failures also return 401 when a valid client Bearer token is attached.

Expected: 400 for unreadable/missing/incorrectly structured JSON; 415 for unsupported request media type; 406 for an unsupported Accept type. These cases should not instruct clients to reauthenticate. Impact: wrong client recovery behavior and unusable negative contract assertions.

Evidence: the malformed JSON reproduction above returned the same 401 in the initial and follow-up runs; the related input variants are listed above. Investigate exception handling and error dispatch authorization; source permits ASYNC dispatch but does not explicitly permit ERROR dispatch. This is a root-cause hypothesis, not a confirmed deployed-code diagnosis.

Additional protocol reproductions (use the documented local demo client):

```sh
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: text/plain' \
  --data-binary '{"username":"client","password":"client"}'
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: application/json' \
  -H 'Accept: application/xml' --data-binary '{"username":"client","password":"client"}'
```

Both returned 401; expected 415 and 406 respectively (BUG-01).

## Impact

Clients receive an authentication error for invalid requests and cannot choose the correct recovery action.

## Evidence and investigation notes

Discovered during sign-in exploration on 2026-09-10. The reproduction and sanitized observations above are sufficient to investigate without the ignored scratch files. Any suspected cause above remains a hypothesis until checked against the deployed build.

## Acceptance criteria and retest

- [ ] Malformed/missing/incorrectly structured JSON returns 400.
- [ ] Unsupported Content-Type returns 415 and unsupported Accept returns 406.
- [ ] Valid login and incorrect-credential behavior remain correct.
- [ ] Link a regression test or record why verification remains manual.

**Retested on/build:** Not yet retested after a fix.  
**Retest evidence:** None; this filing adds documentation only.

## Side effects / cleanup

Successful login reproduction issues access/refresh tokens. Redact them from evidence. Do not use global logout on shared accounts; it can revoke other sessions. The original session did not change MFA or account profiles.
