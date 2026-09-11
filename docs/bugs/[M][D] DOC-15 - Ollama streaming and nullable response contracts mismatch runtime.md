# [D] Ollama endpoints — streaming and nullable response contracts mismatch runtime

**ID:** DOC-15 · **Status:** Open · **Category:** D · **Observed on:** 2026-09-11

## Environment and preconditions

Gateway `http://localhost:8081`, backend image `slawekradzyminski/backend:3.7.16`, upstream `slawekradzyminski/ollama-mock:1.0.9`. Disposable ROLE_CLIENT without MFA. Deployed source revisions unverified. [Captured contract](../exploratory-testing/openapi-2026-09-11-8081.json). Port 4001 is a separate environment and is excluded from this finding.

## Steps to reproduce

Authenticate a disposable client and substitute its access token for `$TOKEN`:

```sh
curl --silent --show-error --no-buffer --max-time 20 -i \
  http://localhost:8081/api/v1/ollama/generate \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data-binary '{"model":"qwen3.5:2b","prompt":"Summarize the release plan"}'
```

Repeat with `{}`. Also POST `/api/v1/ollama/chat` with `{"model":"qwen3.5:2b","messages":[{"role":"user","content":"Give me a quick status update on the Ollama mock"}]}`. GET `/api/v1/ollama/chat/tools/definitions` with the same token. Remove the Authorization header to observe 401.

## Actual result and documentation mismatch

- All three POST operations emit **200 text/event-stream**, with one JSON object per event, including multiline `data:` fields. Swagger declares an array of response DTOs.
- Generate content events contain `thinking: null`, `context: null`, `total_duration: null`; its final event contains `response: null`. `GenerateResponseDto` declares non-null string/array/integer types for these fields.
- Chat's final event contains `message: null`; `ChatResponseDto.message` references a non-null object. Chat message content/thinking/tool names and tool metadata also carry nulls that their declared types exclude.
- Tool definitions include `parameters.required: null`, `parameters.oneOf: null` and property `enum: null`, but `OllamaToolParametersDto` and `OllamaToolSchemaPropertyDto` declare arrays.
- POST `{}` returns **400 application/json**, e.g. `{"model":"must not be blank","prompt":"must not be blank"}` for generate. Missing credentials return **401 application/json** with `{"message":"Unauthorized"}`. The POST operations advertise SSE success arrays for these errors.
- Tool chat with an empty tools array returns **400 application/json** with `{"error":"At least one tool definition is required"}`, also absent from its advertised response shape.

Reproduced across the initial and follow-up exploratory passes and the endpoint tests. Generation had 58 events, first bytes at approximately 61 ms and final bytes at 3044 ms in the initial run; chat had 54 events. Timing is evidence from that run, not an SLA.

## Expected result and basis

The published contract should describe the actual supported wire representation: one DTO per SSE data event, JSON error bodies with their own schemas/media types, and explicit nullable types for supported absent values. Optional properties alone do not permit a present null. No upstream 404/500 behavior was reproduced with this mock, so those branches need separate controlled fault injection before making runtime claims.

## Impact assessment

Consumers validating normal events or tool definitions against Swagger reject valid responses; clients generated from the response declarations can expect arrays where event data is an object. Error consumers are given a streaming success model instead of field errors. Hand-written SSE clients can work around the discrepancy; the happy path itself completes.

## Severity decision

**Medium:** routine successful payloads violate declared types and require integration workarounds. No outage or authorization bypass is claimed.

## Acceptance criteria and retest

- [ ] Model each SSE event and JSON error response accurately on all three POST routes.
- [ ] Allow observed nulls in stream DTOs and tool definitions, or intentionally omit them with corresponding compatibility tests.
- [ ] Validate representative generation, chat, tool exchange, definitions, 400 and 401 payloads against the corrected contract.

**Retested on/build:** No fixed-build retest. Passing regression tests validate runtime behavior, not full schema conformance.

## Side effects / cleanup

Exploratory and automated users were deleted. Product reads/tool lookups did not mutate catalog state. Temporary raw output remains in ignored `exploration/`.
