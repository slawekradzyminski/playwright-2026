# [D] User prompts and password recovery — successful responses contain undocumented null

Status: Open. Observed and reproduced on 2026-09-10 through http://localhost:8081, using disposable ROLE_CLIENT users without MFA. Running image/source revision was not identified. Both exploratory accounts were removed with verified 204 responses after each session.

## Reproduction and evidence

1. Register and log in a disposable user.
2. PUT `/api/v1/users/tool-system-prompt` with Authorization Bearer and JSON `{"toolSystemPrompt":null}`.
3. Observe `200 {"toolSystemPrompt":null}`. GET the same route: it returns the default prompt string.
4. Repeat for `/api/v1/users/chat-system-prompt` with `{"chatSystemPrompt":null}`: the same behavior occurs.
5. PUT `{}` also returns the corresponding field with null.

The live OpenAPI and existing September 10 snapshot declare each field as a string with maximum length 5000 and do not allow null. The properties are optional, so `{}` is a documented valid body, but its successful response contradicts the declared string type. Optional does not mean nullable.

## Impact assessment

The ordinary missing-field request produces a success response incompatible with the documented response type. Schema validation will reject that null value; typed consumers must accommodate an undocumented branch. No production consumer failure was demonstrated. Explicit-null request acceptance and missing-field reset semantics also need a documented policy.

## Severity rationale and decision

Prompt reset and unknown-account recovery return successful responses containing null values excluded by their types. Strict consumers must accommodate an undocumented success branch, exceeding missing error guidance. Reset policy requires clarification, but the response-type contradiction is recorded; production consumer failure is unverified.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Expected behavior and retest

Clarify reset semantics and align the request and response schemas with the agreed behavior. If null is intended, explicitly allow and describe it; otherwise return a contract-compliant result or validation error. After that decision, retest null, omitted, empty and nonempty fields on both endpoints. Active automation covers strings and empty-string reset; it does not bless the undocumented null branch.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Both prompt PUT operations with an omitted field again returned 200 with the corresponding null field; their schemas still require a string when that property is present. Extended scope: an unknown forgot-password identifier returns 202 with token null, although ForgotPasswordResponseDto.token declares only string. Its description limits token exposure to local/testing profiles, but does not make a present null schema-valid. The recorded consequence is successful-response type contradictions; production consumer impact remains unverified.
