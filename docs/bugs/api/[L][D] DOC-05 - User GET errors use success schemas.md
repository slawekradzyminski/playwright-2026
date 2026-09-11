# [D] GET /api/v1/users and /me — Unauthorized responses use success schemas

Status: Open. Observed and reproduced on 2026-09-10 through http://localhost:8081. Deployed image/source revision and effective rate-limit configuration were not identified. Accounts: disposable ROLE_CLIENT without MFA and configured local administrator.

## Evidence and reproduction

Run `curl -i http://localhost:8081/api/v1/users` and repeat with `/api/v1/users/me`. Both return 401, JSON content type, and `{"message":"Unauthorized"}`. Adding `Authorization: Bearer invalid` returns 401 with `{"message":"Invalid or expired token"}`. Both branches were reproduced before automation.

The live `/v3/api-docs` declares the 401 body as an array of UserResponseDto for `/users` and UserResponseDto for `/users/me`, matching the existing [September 10 snapshot](../../exploratory-testing/openapi-2026-09-10.json). Neither describes the observed error message. The array declaration directly conflicts with the returned object; the permissive object schema may accept the error while giving consumers the wrong model.

## Impact assessment

Consumers following Swagger receive misleading error models and must inspect actual responses to implement error handling. Authentication still rejects the requests; no consumer outage or authentication bypass was demonstrated.

## Severity rationale and decision

User-read error bodies do not match their advertised success models, preventing reliable error typing from Swagger alone. Authentication rejection still works and manual error parsing is available. No consumer outage or authorization bypass was demonstrated.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Expected behavior and retest

Document 401 bodies using ErrorDto, with examples for missing credentials and invalid tokens. Retest both routes without a token and with an invalid token; compare the generated schema with the responses. Active API tests cover the runtime rejection behavior, not the incorrect Swagger model.


## Scope extension — username lookup, 2026-09-10

GET `/api/v1/users/{username}` without Authorization also returns `401 {"message":"Unauthorized"}` while Swagger uses UserResponseDto. Reproduced using a disposable existing username during two subsequent exploratory sessions. The same impact, severity and proposed ErrorDto correction apply. Its 404 branch already uses ErrorDto and returned `{"message":"The user doesn't exist"}` as documented.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Unauthenticated list, me and username lookups returned 401 error maps. Their unchanged Swagger responses still reference UserResponseDto. No claim is made that public-directory visibility is an authorization defect.
