# [FA] POST /api/v1/ollama/chat/tools — completion marker semantics are unclear

**ID:** BUG-12 · **Status:** Needs clarification · **Category:** FA · **Observed on:** 2026-09-11

## Environment and preconditions

`http://localhost:8081`; backend `slawekradzyminski/backend:3.7.16`; mock `slawekradzyminski/ollama-mock:1.0.9`; disposable ROLE_CLIENT, no MFA. Deployed source revision unverified. Contract (the referenced September 11 snapshot is missing from this checkout; recorded observations remain in the reports).

## Steps to reproduce

1. Authenticate and GET `/api/v1/ollama/chat/tools/definitions`.
2. POST `/api/v1/ollama/chat/tools` with model `qwen3.5:2b`, those definitions as `tools`, and one user message: `What Beauty products do we have available?`.
3. Consume all SSE events until HTTP EOF and inspect their order. Repeat with `What iphones do we have available? Tell me the details about them` for two iterations of tool execution.

## Actual result

The beauty request returns 200 and 47 events (zero-based completion indexes 1 and 46):

```text
0: assistant tool_call list_products
1: done=true, message=null
2: role=tool, tool_name=list_products, done=false
3..45: assistant answer chunks, done=false
46: done=true, message=null
HTTP EOF
```

The two-tool request returns 70 events with `done=true` at indexes 1, 4 and 69. Backend results and the final assistant response appear after earlier completion markers. Repeated beauty requests and the subsequent automated tool requests reproduce intermediate completion markers. Counts describe this mock scenario, not a required tokenization contract.

## Expected result and basis

**Proposed requirement, not yet agreed:** reserve `done=true` for completion of the entire public endpoint response, or explicitly document it as completion of one upstream model iteration and expose a distinct final-response signal. Swagger only calls it a boolean and does not distinguish these meanings. Confirm the intended client consumption rule before classifying this as a confirmed functional defect.

## Impact assessment

A consumer stopping at the first completion marker receives the tool call but none of the backend result or assistant answer. A consumer reading until HTTP EOF receives the full response. No failure of the existing frontend was demonstrated; the impact depends on the intended meaning of `done`.

## Severity rationale and decision

Stopping at the first done marker omits tool results and the final answer, whereas reading to HTTP EOF obtains the complete response. The marker scope is not agreed and no supported frontend failure was shown. The classification is provisional for this integration ambiguity, pending a consumption contract or affected consumer evidence.

**Severity:** L (provisional)

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Acceptance criteria and retest

- [ ] Agree and document whether `done` means iteration completion or public-response completion.
- [ ] Confirm one-tool and two-tool consumers display the full assistant answer under that rule.
- [ ] If `done` is terminal, suppress intermediate completion markers and add the regression after the fix.

The passing suite reads to EOF and requires a final completion event; it deliberately does not assert intermediate completion markers as approved behavior.

## Side effects / cleanup

Disposable users were removed with 204. Catalog operations were read-only; seeded product 1 was read, not modified. No fixed-build retest has been performed.
