# BUG-052: Chat role badges use aria-label on generic div elements

## Severity rationale

Rendered transcript badges attach User/Assistant names to generic divs, where this ARIA attribute is prohibited. Nearby visible role text still identifies the speaker, so this finding does not establish a blocked conversation or missing speaker information. The defect is limited to redundant, invalid semantics; no screen-reader session was performed.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui
- Status: Open
- Severity (proposed): Low

## Endpoint

`/llm/chat` and shared ChatTranscript used by `/llm/tools`.

## Environment

2026-09-09, http://localhost:8081, frontend 3.7.14; Chromium, axe-core scan of main, desktop/tablet/mobile.

## Preconditions

Disposable authenticated customer; at least one completed chat exchange.

## Reproduction

1. Open /llm/chat and submit `Give me a quick status update on the Ollama mock`.
2. Inspect `[data-testid="chat-role-pill-user"]` and `[data-testid="chat-role-pill-assistant"]`.
3. Run axe on main after the result.

## Expected

Use valid semantics for decorative/redundant role icons. A generic div should not carry aria-label; rely on the adjacent visible role label or use an appropriate semantic role when needed.

## Actual

Both generic divs carry aria-label. axe reports `aria-prohibited-attr` on these badges after the message renders.

## Evidence

[Chat scan results](../exploration/ui/2026-09-09-ollama-01/chat-exploration.json), all three widths.

![Transcript with visible role labels](../exploration/ui/2026-09-09-ollama-01/screenshots/chat-1440-success.png)

Images and raw scan evidence are ignored and workspace-only. The component and DOM selectors above provide portable reproduction.

## Impact

Invalid redundant accessibility metadata. Actual assistive-technology announcement behavior is untested.

## Cleanup

Disposable browser account deleted through the existing API factory; no persisted conversation changes.

## Follow-up and automation

Correct shared ChatTranscript semantics and rerun axe. Functional message assertions remain eligible.
