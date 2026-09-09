# BUG-020: User read authentication errors use success schema in OpenAPI

## Severity rationale

Both account-read operations return authentication error objects while declaring a user DTO or list. Contract-based consumers need a different model to expose authentication failures, the same interface incompatibility identified in cart and prompt reports. Runtime access remains protected; an actual generated-client failure is untested.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium
- Endpoint: `GET /api/v1/users`, `GET /api/v1/users/{username}`
- Environment: 2026-09-08, configured local gateway (base URL omitted), deployed backend `3.7.16`, OCI revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`; contract `docs/openapi.json` version 1.0.

## Preconditions

No authentication header. Disposable usernames were used for detail probes; no shared data was changed.

## Reproduction

```text
GET /api/v1/users
GET /api/v1/users/<disposable-username>
```

No credentials were supplied.

## Expected

The runtime should reject unauthenticated requests with 401 JSON error `{ "message": "Unauthorized" }`, as required by the secured endpoints and observed by the backend controller tests. The OpenAPI 401 content should describe the error object rather than the successful user list or user DTO. The detail 404 error is correctly documented as `ErrorDto`.

## Actual

Both requests returned `401 application/json` with `{ "message": "Unauthorized" }`. In `docs/openapi.json`, the list 401 schema is an array of `UserResponseDto`, and the detail 401 schema is `UserResponseDto`.

## Evidence

Exploration report: [2026-09-08-accounts.md](../exploration/2026-09-08-accounts.md), cases E02 and E04. Reproduced once per endpoint. Credentials and tokens were excluded.

## Impact

Generated clients may attempt to deserialize a JSON error as a successful account collection or DTO and fail to expose the authentication error cleanly.

## Cleanup

No resources were created by these probes; disposable users from the broader exploration were deleted separately.

## Follow-up and automation

Correct both 401 response schemas to `ErrorDto` and regenerate the contract. API tests assert the verified runtime error body and link this report; they do not assert the incorrect schema.

