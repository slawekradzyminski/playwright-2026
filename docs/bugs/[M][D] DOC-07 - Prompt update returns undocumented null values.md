# [D] PUT user system prompts — Successful response contains undocumented null

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

Severity: Medium. Category: Documentation, consistent with DOC-02's successful-response type contradiction.

## Expected behavior and retest

Clarify reset semantics and align the request and response schemas with the agreed behavior. If null is intended, explicitly allow and describe it; otherwise return a contract-compliant result or validation error. After that decision, retest null, omitted, empty and nonempty fields on both endpoints. Active automation covers strings and empty-string reset; it does not bless the undocumented null branch.
