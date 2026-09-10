# [D] User prompt and refresh operations — Error schemas misdescribe responses

Status: Open. Observed and reproduced on 2026-09-10 at http://localhost:8081. Deployed build identity and effective rate-limit configuration were not identified. Tests used disposable ROLE_CLIENT accounts without MFA; administrator cleanup returned 204.

## Evidence

The live `/v3/api-docs` and existing September 10 snapshot document prompt GET/PUT 401 bodies as the corresponding prompt DTO. GET requests without Authorization and PUT requests with a valid prompt body but no Authorization return `401 {"message":"Unauthorized"}`. Automated checks additionally cover empty, malformed, and tampered Bearer tokens.

For both prompt fields, PUT with a 5001-character string returns 400 with a field-keyed validation message: `Tool system prompt must be at most 5000 characters` or `Chat system prompt must be at most 5000 characters`. Swagger models these errors as successful prompt values, even though the response is a validation map.

POST `/api/v1/users/refresh` with `{}` returns `400 {"refreshToken":"must not be blank"}`. With `{"refreshToken":"invalid"}` it returns `401 {"message":"Invalid refresh token"}`. Both error statuses are documented as TokenRefreshResponseDto, whose fields represent issued credentials. These observations were reproduced in two exploratory sessions before final verification.

## Impact assessment

Swagger gives consumers misleading models for rejected requests. Permissive schemas may even accept validation messages as successful prompt/token strings. Runtime rejection works; no downstream outage was demonstrated.

Severity: Low. Category: Documentation.

## Expected behavior and retest

Use ErrorDto for message errors and a validation-error map for field errors. Retest each operation/status with the requests above and compare the generated schema, descriptions and examples against actual bodies.
