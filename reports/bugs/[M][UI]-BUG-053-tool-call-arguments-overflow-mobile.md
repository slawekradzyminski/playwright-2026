# BUG-053: Tool-call arguments overflow their message bubble on narrow screens

## Severity rationale

Tool-chat users cannot see the complete function arguments within the message bubble at narrow widths. On 360px the unbroken JSON line extends beyond the viewport, and on tablet it extends outside the bubble. The final answer still arrives; inspecting the arguments requires a wider display. No data is lost or changed.

## Classification

- Type: Functional
- Category: ui
- Tags: ui, functional
- Status: Open
- Severity (proposed): Medium

## Endpoint

`/llm/tools`

## Environment

2026-09-09, local gateway http://localhost:8081; frontend 3.7.14, mock 1.0.9; Chromium 360×800 and 768×1024.

## Preconditions

Disposable authenticated customer; default tool definitions loaded.

## Reproduction

1. Visit /llm/tools at 360×800.
2. Submit `What Beauty products do we have available?`.
3. Scroll to Function call requested and inspect the arguments.
4. Compare the same result at 768×1024.

## Expected

The serialized arguments should wrap or have a usable local scroll area without painting outside their message container. The UI exposes these arguments for inspection.

## Actual

The JSON arguments in ToolCallNotice render as one unbroken code line outside the bubble. At 360px part lies beyond the viewport. At 768px the line also extends past the nested bubble edge.

## Evidence

![Mobile argument overflow](../exploration/ui/2026-09-09-ollama-01/screenshots/tools-360-success.png)
![Tablet argument overflow](../exploration/ui/2026-09-09-ollama-01/screenshots/tools-768-success.png)

Images inspected locally; ignored/workspace-only. [Review](../exploration/ui/2026-09-09-ollama-01/review.md).

## Impact

Users lose readable access to the complete displayed function arguments at narrow widths.

## Cleanup

Read-only catalog requests; disposable customer scheduled for cleanup after exploration.

## Follow-up and automation

Fix wrapping/overflow in ToolCallNotice. Recheck mobile/tablet; keep the verified desktop tool execution journey in functional automation.
