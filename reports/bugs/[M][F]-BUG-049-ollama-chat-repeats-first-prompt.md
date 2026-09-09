# BUG-049: Mock chat repeats the first scenario instead of answering a follow-up

## Severity rationale

Multi-turn chat users receive the first answer again after asking another supported question. A fresh conversation allows the second prompt to work, but loses the current conversation. This blocks reliable multi-turn regression coverage; no server-side history or persistent data is changed.

## Classification

- Type: Functional
- Category: functional
- Tags: api, ui, functional
- Status: Open
- Severity (proposed): Medium

## Endpoint

`POST /api/v1/ollama/chat`

## Environment

2026-09-09, http://localhost:8081, backend 3.7.16, frontend 3.7.14, mock 1.0.9. Disposable customer / anonymous. Contract: docs/openapi.json and live /v3/api-docs.

## Preconditions

Authenticated disposable customer for valid and validation requests; no authentication for unauthorized scenarios.

## Reproduction

Send model qwen3.5:2b and messages: user Give me a quick status update on the Ollama mock; assistant with the known status answer; user What limitations should I expect from the mock?.

## Expected

The stateless chat contract requires resending history. The mock has a dedicated limitations scenario; the latest question should select that scenario rather than repeat the earlier status answer.

## Actual

200 SSE repeats the status-update response verbatim. Mock ChatDialogueScenarioRepository is the selection point; deployed source alignment is limited to the inspected scenario files.

## Evidence

E05 in ../exploration/2026-09-09-ollama-01/api-evidence.json. Evidence is ignored and available only in the originating workspace; textual steps above are portable.

## Impact

Multi-turn chat users receive the first answer again after asking another supported question. A fresh conversation allows the second prompt to work, but loses the current conversation. This blocks reliable multi-turn regression coverage; no server-side history or persistent data is changed.

## Cleanup

API exploration account deleted (204); browser account retained only for ongoing exploration, scheduled for API cleanup. No shared settings or seeded products changed.

## Follow-up and automation

Defer live multi-turn answer assertions; fix scenario selection and explore again. Propose a mock repository test with two different supported user messages separated by an assistant reply.
