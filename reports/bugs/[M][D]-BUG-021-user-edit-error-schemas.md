# BUG-021: User edit error responses use UserEntity schema in OpenAPI

## Severity rationale

Account-edit validation and access errors are documented as UserEntity rather than field/error objects. Integrators lose the declared models needed to explain field correction or denied access, as in the comparable cart error-schema finding. Runtime rejections remain correct; no account corruption or consumer outage was observed.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium
- Endpoint: `PUT /api/v1/users/{username}`
- Environment: 2026-09-08, configured local gateway (base URL omitted), deployed backend `3.7.16`, OCI revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`; contract `docs/openapi.json` version 1.0.

## Preconditions

Disposable authenticated customer accounts; no shared account was edited.

## Reproduction

```text
PUT /api/v1/users/<disposable-username>
Content-Type: application/json
Authorization: Bearer <valid-token>

{"email":"","firstName":"abc","lastName":"abc"}
```

Equivalent 401 and 403 probes used the same endpoint with no credentials and with another customer’s token.

## Expected

The runtime should return JSON error objects for 400 validation, 401 unauthenticated, 403 forbidden, and 404 missing-user responses. OpenAPI should describe a field-error map for 400 and `ErrorDto` for 401/403/404.

## Actual

Runtime responses were correct: 400 returned a field-error JSON object, 401 returned `{ "message": "Unauthorized" }`, 403 returned `{ "message": "Access denied" }`, and 404 returned `{ "message": "The user doesn't exist" }`. The saved OpenAPI contract documents `UserEntity` for 400, 401, and 403, while only 404 uses `ErrorDto`.

## Evidence

Exploration report: [2026-09-08-accounts.md](../exploration/2026-09-08-accounts.md), cases E08–E11. Reproduced once per response path. Credentials and tokens were excluded.

## Impact

Generated clients may deserialize edit failures as a user entity and hide useful validation or authorization details.

## Cleanup

Disposable users were deleted after exploration; no shared account or catalog data was changed.

## Follow-up and automation

Change the 400/401/403 schemas to the actual error models. API tests assert verified status/body behavior and link this report above affected tests.

