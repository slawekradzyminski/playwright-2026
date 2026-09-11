# [D] User mutation, prompt and session endpoints — error contracts misdescribe responses

Status: Open. Observed and reproduced on 2026-09-10 at http://localhost:8081. Deployed build identity and effective rate-limit configuration were not identified. Tests used disposable ROLE_CLIENT accounts without MFA; administrator cleanup returned 204.

## Evidence

The live `/v3/api-docs` and existing September 10 snapshot document prompt GET/PUT 401 bodies as the corresponding prompt DTO. GET requests without Authorization and PUT requests with a valid prompt body but no Authorization return `401 {"message":"Unauthorized"}`. Automated checks additionally cover empty, malformed, and tampered Bearer tokens.

For both prompt fields, PUT with a 5001-character string returns 400 with a field-keyed validation message: `Tool system prompt must be at most 5000 characters` or `Chat system prompt must be at most 5000 characters`. Swagger models these errors as successful prompt values, even though the response is a validation map.

POST `/api/v1/users/refresh` with `{}` returns `400 {"refreshToken":"must not be blank"}`. With `{"refreshToken":"invalid"}` it returns `401 {"message":"Invalid refresh token"}`. Both error statuses are documented as TokenRefreshResponseDto, whose fields represent issued credentials. These observations were reproduced in two exploratory sessions before final verification.

## Impact assessment

Swagger gives consumers misleading models for rejected requests. Permissive schemas may even accept validation messages as successful prompt/token strings. Runtime rejection works; no downstream outage was demonstrated.

## Severity rationale and decision

User mutation, prompt and session errors are modeled as successful responses rather than validation maps or message objects. Consumers need manual error models, while the recorded rejection behavior remains effective. No failed successful operation or downstream outage was established by these error-schema gaps.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Expected behavior and retest

Use ErrorDto for message errors and a validation-error map for field errors. Retest each operation/status with the requests above and compare the generated schema, descriptions and examples against actual bodies.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Unauthenticated prompt reads still returned JSON message errors. Passing refresh tests reconfirm invalid-token error bodies. Extended scope: profile PUT 400/401/403 reference UserEntity although actual responses are field maps or message errors; forgot-password 400 references ForgotPasswordResponseDto although an empty identifier returns an identifier field error. Both DELETE routes return JSON 401/403 errors without corresponding body schemas. These are related user error-contract gaps, not additional functional failures. 
