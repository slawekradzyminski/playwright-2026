# BUG-051: Mobile chat leaves too little space to enter and read messages

## Severity rationale

At a 360px viewport, chat's nested panels and side-by-side Send button leave an approximately 80px-wide textarea with still less space for text. Even the placeholder wraps into fragments and clips; replies also break words and require lengthy scrolling. Typing remains possible, and a wider viewport recovers usability, but mobile conversation is materially harder. No data loss was observed.

## Classification

- Type: Functional
- Category: ux
- Tags: ux, ui
- Status: Open
- Severity (proposed): Medium

## Endpoint

`/llm/chat`; also reproduced on `/llm/tools` with the same input/transcript structure.

## Environment

2026-09-09, http://localhost:8081, frontend 3.7.14, mock 1.0.9; Chromium resized desktop at 360×800, light theme, disposable customer.

## Preconditions

API-authenticated customer. No shared data changes.

## Reproduction

1. Set viewport to 360×800 and visit /llm/chat.
2. Inspect the message input before typing.
3. Enter `Give me a quick status update on the Ollama mock` and submit.
4. Scroll the reply and try entering a follow-up.

## Expected

A conversational form should provide enough mobile writing space to read normal words and the input cue. Stack the action below the input or reduce nested padding. This is a usability expectation; no exact minimum width is specified by product documentation.

## Actual

Placeholder wraps into narrow fragments and is vertically clipped. Both user and assistant bubbles leave a very narrow text column, splitting words such as deterministic and backend/frontend. Tablet and desktop are substantially more readable.

## Evidence

![Mobile chat before entry](../exploration/ui/2026-09-09-ollama-01/screenshots/chat-360-initial.png)
![Mobile chat result](../exploration/ui/2026-09-09-ollama-01/screenshots/chat-360-success.png)

Inspected screenshots and CLI results: [review](../exploration/ui/2026-09-09-ollama-01/review.md). Images are ignored/workspace-only; textual reproduction remains portable.

## Impact

Mobile typing and response reading are needlessly difficult despite successful HTTP responses.

## Cleanup

Disposable browser account will be removed after exploration; no catalog or shared prompt mutations.

## Follow-up and automation

Adjust responsive padding and input/button layout, then review 360px and nearby widths. Keep desktop functional tests; do not add screenshot baselines or encode the narrow layout as expected.
