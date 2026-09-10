# [M][D] POST /api/v1/users/signin — Error responses are documented as successful login objects

**ID:** DOC-01  
**Status:** Open  
**Severity:** Medium — Integrations and generated tests use the wrong response model for validation and credential failures.  
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

**Reproduce:** open `paths["/api/v1/users/signin"].post.responses` in the saved JSON, then compare these responses:

```sh
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: application/json' \
  --data-binary '{"username":"abc","password":"xxxx"}'
curl -i http://localhost:8081/api/v1/users/signin -H 'Content-Type: application/json' \
  --data-binary '{"username":"explore_missing_20260910","password":"WrongPassword123!"}'
```

Actual: 400 `{"username":"Minimum username length: 4 characters"}` and 422 `{"message":"Invalid username/password supplied"}`.

The live sign-in responses for both 400 and 422 reference `LoginResponseDto`. Actual 400 length validation is a field-error map; actual 422 is `{"message":"Invalid username/password supplied"}`. Neither represents a successful login payload.

Correct 422 to `ErrorDto`, document the field-validation object for 400, and describe parse-error response shape after BUG-01 is fixed. Use explicit `application/json` response media types. Because all LoginResponseDto properties are optional and additional properties are unconstrained, a permissive schema validator may misleadingly accept these error bodies despite the incorrect model.

## Impact

Integrations and generated tests use the wrong response model for validation and credential failures.

## Evidence and investigation notes

Discovered during sign-in exploration on 2026-09-10. The reproduction and sanitized observations above are sufficient to investigate without the ignored scratch files. Any suspected cause above remains a hypothesis until checked against the deployed build.

## Acceptance criteria and retest

- [ ] 400 describes field validation errors and 422 references ErrorDto.
- [ ] Recorded validation and invalid-credential responses match the documented models.
- [ ] Parse-error documentation is aligned with the BUG-01 resolution.
- [ ] Link a regression test or record why verification remains manual.

**Retested on/build:** Not yet retested after a fix.  
**Retest evidence:** None; this filing adds documentation only.

## Side effects / cleanup

The shown failing requests returned no login tokens. No account edits or cleanup actions were performed for this finding.
