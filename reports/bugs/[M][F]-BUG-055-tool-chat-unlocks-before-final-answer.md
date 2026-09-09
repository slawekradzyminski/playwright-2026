# BUG-055: Tool chat unlocks input before the response finishes

## Severity rationale

During a tool-assisted response the input becomes enabled after the first tool-stage completion while further tool processing and final answer tokens are still arriving. This permits a second request to overlap and risks mixed history. Premature enablement is observed; transcript corruption is not yet reproduced. Waiting manually until the final text stops is a workaround.

## Classification

- Type: Functional
- Category: functional
- Tags: functional, ui
- Status: Open
- Severity (proposed): Medium

## Endpoint

`/llm/tools`

## Environment

2026-09-09, http://localhost:8081; frontend 3.7.14, backend 3.7.16, mock 1.0.9; Chromium 1440×900. Disposable customer.

## Preconditions

API-authenticated customer; supported deterministic mock prompt.

## Reproduction

Visit /llm/tools, use qwen3.5:2b and submit What Beauty products do we have available?. Observe input enabled state when list_products output appears, before the full final answer has arrived.

## Expected

Keep the request in-flight until the complete tool-orchestration stream ends; intermediate model iteration markers must not permit another user submission.

## Actual

Input is already enabled at the response headers and when the tool output appears, while the browser response clone is still consuming SSE. The upstream emits done=true per iteration; the hook calls stop() on those intermediate markers.

## Evidence

[CLI evidence](../exploration/ui/2026-09-09-ollama-01/tools-states.json) and [review](../exploration/ui/2026-09-09-ollama-01/review.md), ignored/workspace-only.

## Impact

During a tool-assisted response the input becomes enabled after the first tool-stage completion while further tool processing and final answer tokens are still arriving. This permits a second request to overlap and risks mixed history. Premature enablement is observed; transcript corruption is not yet reproduced. Waiting manually until the final text stops is a workaround.

## Cleanup

One-shot route removed automatically; browser account scheduled for deletion. No shared prompts or products changed.

## Follow-up and automation

Fix useOllamaToolChat, explore corrected behavior, then add passing recovery/concurrency regression. Do not assert the defect or hide it with a skip.
