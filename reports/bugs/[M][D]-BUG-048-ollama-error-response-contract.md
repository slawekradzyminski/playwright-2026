# BUG-048: Ollama error responses do not match advertised streams

## Severity rationale

Clients generated from the published schema expect successful stream DTOs for validation/authentication errors, but receive JSON maps. This impairs error handling across four operations. Successful calls remain usable; consumers can implement the observed JSON contract manually. No persistent data loss was observed.

## Classification

- Type: Documentation/contract
- Category: contract
- Tags: api, contract
- Status: Open
- Severity (proposed): Medium

## Endpoint

`POST /api/v1/ollama/generate`, `/chat`, `/chat/tools`; `GET /api/v1/ollama/chat/tools/definitions`

## Environment

2026-09-09, http://localhost:8081, backend 3.7.16, frontend 3.7.14, mock 1.0.9. Disposable customer / anonymous. Contract: docs/openapi.json and live /v3/api-docs.

## Preconditions

Authenticated disposable customer for valid and validation requests; no authentication for unauthorized scenarios.

## Reproduction

Send an authenticated generate request with model qwen3.5:2b and prompt consisting of one space; send chat/tools with messages []; request each route without a bearer token and with an invalid bearer token.

## Expected

Saved docs/openapi.json and the identical live Ollama contract advertise stream DTO arrays for POST 400/401 and tool-definition arrays for GET 401.

## Actual

POST validation returns application/json field maps (prompt: must not be blank; messages: At least one message is required). Missing tools returns {error: At least one tool definition is required}. All four 401 responses are JSON message objects (Unauthorized / Invalid or expired token), not advertised success DTO arrays.

## Evidence

E08/E09 in ../exploration/2026-09-09-ollama-01/api-evidence.json. Evidence is ignored and available only in the originating workspace; textual steps above are portable.

## Impact

Clients generated from the published schema expect successful stream DTOs for validation/authentication errors, but receive JSON maps. This impairs error handling across four operations. Successful calls remain usable; consumers can implement the observed JSON contract manually. No persistent data loss was observed.

## Cleanup

API exploration account deleted (204); browser account retained only for ongoing exploration, scheduled for API cleanup. No shared settings or seeded products changed.

## Follow-up and automation

Keep verified 400/401 tests and link this documentation-only report. Update the documented media types and schemas.
