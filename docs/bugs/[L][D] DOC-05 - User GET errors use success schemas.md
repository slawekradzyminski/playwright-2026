# [D] GET /api/v1/users and /me — Unauthorized responses use success schemas

Status: Open. Observed and reproduced on 2026-09-10 through http://localhost:8081. Deployed image/source revision and effective rate-limit configuration were not identified. Accounts: disposable ROLE_CLIENT without MFA and configured local administrator.

## Evidence and reproduction

Run `curl -i http://localhost:8081/api/v1/users` and repeat with `/api/v1/users/me`. Both return 401, JSON content type, and `{"message":"Unauthorized"}`. Adding `Authorization: Bearer invalid` returns 401 with `{"message":"Invalid or expired token"}`. Both branches were reproduced before automation.

The live `/v3/api-docs` declares the 401 body as an array of UserResponseDto for `/users` and UserResponseDto for `/users/me`, matching the existing [September 10 snapshot](../exploratory-testing/openapi-2026-09-10.json). Neither describes the observed error message. The array declaration directly conflicts with the returned object; the permissive object schema may accept the error while giving consumers the wrong model.

## Impact assessment

Consumers following Swagger receive misleading error models and must inspect actual responses to implement error handling. Authentication still rejects the requests; no consumer outage or authentication bypass was demonstrated.

Severity: Low. Category: Documentation.

## Expected behavior and retest

Document 401 bodies using ErrorDto, with examples for missing credentials and invalid tokens. Retest both routes without a token and with an invalid token; compare the generated schema with the responses. Active API tests cover the runtime rejection behavior, not the incorrect Swagger model.


## Scope extension — username lookup, 2026-09-10

GET `/api/v1/users/{username}` without Authorization also returns `401 {"message":"Unauthorized"}` while Swagger uses UserResponseDto. Reproduced using a disposable existing username during two subsequent exploratory sessions. The same impact, severity and proposed ErrorDto correction apply. Its 404 branch already uses ErrorDto and returned `{"message":"The user doesn't exist"}` as documented.
