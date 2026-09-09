# BUG-054: Plain chat cannot recover after a failed request

## Severity rationale

A transient failed chat request leaves an empty assistant entry in local history. Every retry resends that invalid entry and is rejected by the live backend. Reloading the page restores service but discards the conversation. The initial outage was simulated; the subsequent rejection came from the real gateway.

## Classification

- Type: Functional
- Category: functional
- Tags: functional, ui
- Status: Open
- Severity (proposed): Medium

## Endpoint

`/llm/chat`

## Environment

2026-09-09, http://localhost:8081; frontend 3.7.14, backend 3.7.16, mock 1.0.9; Chromium 1440×900. Disposable customer.

## Preconditions

API-authenticated customer; supported deterministic mock prompt.

## Reproduction

Inject one 503 JSON response for POST /api/v1/ollama/chat. Submit the supported status prompt. Remove the injection and resubmit the prompt. Inspect the outgoing history and real response.

## Expected

A failed request should not leave invalid placeholder messages in the next request. After service recovery, retry should return the supported response without reloading.

## Actual

The retry includes {role: assistant, content: empty string, thinking: empty string} and receives HTTP 400. The input is enabled, but retry cannot complete.

## Evidence

[CLI evidence](../exploration/ui/2026-09-09-ollama-01/chat-error-events.json) and [review](../exploration/ui/2026-09-09-ollama-01/review.md), ignored/workspace-only.

## Impact

A transient failed chat request leaves an empty assistant entry in local history. Every retry resends that invalid entry and is rejected by the live backend. Reloading the page restores service but discards the conversation. The initial outage was simulated; the subsequent rejection came from the real gateway.

## Cleanup

One-shot route removed automatically; browser account scheduled for deletion. No shared prompts or products changed.

## Follow-up and automation

Fix useOllamaChat, explore corrected behavior, then add passing recovery/concurrency regression. Do not assert the defect or hide it with a skip.
