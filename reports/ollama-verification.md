# Ollama verification — 9 September 2026

Package J and UI-T07 now have 20 API and 10 UI tests. Four gateway operations and three screens have dedicated assertions. This records selected deterministic behavior, not real-model quality or complete feature coverage.

## Execution

| Check | Result | Environment / evidence |
| --- | --- | --- |
| `npm run test:api` | 202 passed, 0 failed/skipped; 16.6s | Local gateway; full suite including 20 new cases |
| `npm run test:ui` | 125 passed, 0 failed/skipped; 23.4s | Configured Chromium desktop; final run after correcting BasePage import casing |
| API coverage generation and consistency | Passed; 39/55 operations, 126/176 documented status pairs | Target assertions and helpers reviewed; four spec hashes added |
| TypeScript check | Passed | Final API/UI source |

Tests are present at repository revision `c916189` with a subsequent working-tree correction to two BasePage import casings. Detailed logs and exploration are workspace-only under `reports/exploration/2026-09-09-ollama-01` and `reports/exploration/ui/2026-09-09-ollama-01`; no CI job is claimed. This tracked record is the portable execution summary.

Initial focused API run: 19 passed, 1 failed because the assertion omitted a generated tool-call ID. Corrected to validate the ID type plus exact function/arguments; rerun 20 passed. Initial full UI run: 125 passed in 26.8s; final rerun above passed after TypeScript identified import casing inconsistent with the tracked filename.

## Assessment and exploration

Given OpenAPI, backend/controller and mock scenario evidence, retained API tests target complete SSE assembly, thinking, validation/authentication and real catalog integration. Lower-level test sources were inspected, not executed. Existing unit assertions cover fragments/mocked collaborators; gateway assertions add complete deterministic responses and actual tool output. UI tests target browser integration through page objects and API-owned fixtures.

When explored before automation, all four operations were reachable. Live Ollama OpenAPI matched the saved contract. Generate/chat thinking on/off, definitions, catalog tool call/output/answer ordering, unknown-prompt guidance and representative 400/401 were observed. A read-only two-step tool scenario was explored using its seeded reference; automation deliberately uses an owned beauty product instead of depending on seeded IDs.

Then complete primary answers were verified, and eight findings were filed: BUG-048 error response documentation; BUG-049 mock selects an earlier prompt; BUG-050 hidden settings focus; BUG-051 narrow mobile input; BUG-052 role badge ARIA; BUG-053 tool arguments overflow; BUG-054 failed plain-chat retry; BUG-055 tool input unlocks before final stream completion. Seven medium and one low, with impact rationales in the [bug index](bugs/README.md). Functional defects remain open and are not treated as passing regressions.

## UI quality evidence and limits

Playwright CLI exploration sampled 1440×900, 768×1024 and 360×800 plus 639/640 and 767/768 breakpoints. All 35 saved screenshots were inspected and indexed in the [local review](exploration/ui/2026-09-09-ollama-01/review.md). axe-core 4.13.0 and keyboard checks confirmed focus and semantic findings. A suspected non-scrollable tool definition region was ruled out: keyboard PageDown scrolled it. No screen-reader, real-device or Safari assessment. The browser did not apply the attempted 200% zoom; zoom remains unverified.

Controlled 503 responses were one-shot browser injections. Generate and tools recovered through the live gateway; plain chat's subsequent real 400 is BUG-054. SSE text was captured separately because browser response-body retrieval failed for event streams. The observer recorded 124 requests/124 responses after browser close: 119 HTTP 200, four injected 503 and one live 400; the 400 body was unavailable, so its exact body is not asserted. Two aborted requests arose during navigation; no uncaught page errors. Duplicate stream-capture entries were instrumentation copies, not duplicate network requests.

At the same desktop viewport, initial plus three repeated local runs measured navigation-to-input and submit-to-complete-stream. Repeat completion ranges: generate 809–842ms, chat 2860–2876ms, tools 3322–3339ms. These tiny mock samples have no SLA and do not measure model inference capacity.

Gaps: interrupted streams, upstream model 404/500 fault behavior, owned snapshot/multi-step automation, deep history/concurrent submission, extended long-output variants and full zoom review. Mock canned summaries do not prove grounding in arbitrary catalog contents; tests assert owned product data in the actual tool output separately.

## Provenance and cleanup

Local source inspected: backend `8cb264a24ef997d635210bc5d0152363f78f8486`, frontend `41e177a6e4b4f53ffb75d0e37b0666dcb9508277`, mock `f08daef13b62072bab7daf85df64c2d5afc0ba30`. Running image labels: backend 3.7.16 / `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`; frontend 3.7.14 / `7d17087601e3ce74f1275bfff5e084a4d6071a5b`; mock 1.0.9 / `492dba736e3b509522ec39ebed352835a16aadc1`. Relevant controller, UI LLM sources and pinned scenario files had no diff across inspected deployed/local revisions; this is scoped alignment, not a whole-deployment attestation.

Disposable API/browser users and owned products were cleaned up using existing factories. Saved browser authentication was removed and the exploration browser closed. No shared prompts or seeded products were modified.
