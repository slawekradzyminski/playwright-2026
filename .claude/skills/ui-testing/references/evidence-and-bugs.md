## Console and API evidence

Start observation before the first navigation or action. Collect browser console warnings/errors, uncaught page errors, failed requests, and **all API requests/responses**, including successful responses. A request failure is a transport failure; HTTP 400/500 responses must also be reviewed explicitly. Correlate each entry with a named scenario and the UI action, then inspect method, route, sanitized payload, status, response body, request count and resulting UI feedback against requirements. Check that client-side validation and navigation do not unexpectedly submit data. Report unexpected errors even when the UI assertion passes; do not treat an expected duplicate-account 400 as a defect.

Use [the CLI observer](../../../../scripts/ui-exploration-observer.js) with a dedicated browser session:

```bash
npx playwright cli -s=exploration run-code --filename=scripts/ui-exploration-observer.js
npx playwright cli -s=exploration run-code "async page => { page.__uiExploration.scenario = 'empty form'; page.__uiExploration.mode = 'live'; }"
# Perform the scenario, then label the next one before its actions.
npx playwright cli -s=exploration --raw run-code "async page => await page.__uiExploration.stop()" > reports/exploration/ui/<run>/browser-events.json
```

Read the exported events; collecting a log alone is not review. Summarize expected and unexpected console/API events per scenario in `review.md`. The observer covers its page only, omits non-JSON and oversized bodies, redacts secret-named JSON fields and URL query values, and excludes sensitive headers. Use disposable data. Inspect the export for secrets before retaining or sharing it; its console text filtering is not a guarantee for arbitrary application logs. Record omitted bodies, late observer startup, other tabs and missing network coverage as limitations. Do not save unsanitized HAR files, auth response dumps or credentials in evidence.

Label each scenario **live**, **mocked**, or **mixed**, and document every injected status/body, delay or aborted request. Set the observer's mode accordingly. A simulated 503 proves UI handling only; it is not an observed backend outage. Remove routes after each simulation. Wait for relevant responses before ending observation, review success bodies as well as errors, and record API fixture setup/cleanup separately from browser traffic.
## Local evidence

Save all screenshots and supplementary exploration artifacts beneath:

```text
reports/exploration/ui/<YYYY-MM-DD>-<feature>-<unique-run>/
  review.md
  screenshots/
    01-initial-mobile-360x800.png
    02-validation-mobile-360x800.png
```

The existing `reports/exploration/*` ignore rule covers this directory. Verify new evidence is ignored with `git check-ignore <path>`; do not force-add it. Use a unique run directory so previous evidence remains available. Keep the complete screenshot set locally for optional user inspection.

In `review.md`, record the application URL/version if known, date, browser/version, OS, actual viewport/emulation settings, relevant theme/locale, scenario setup, tested states and coverage gaps. Use sanitized test data and keep credentials/tokens out of evidence. Include one row per image:

| Screenshot | Page/state and viewport | Observation, evidence, bug or open question | Review result |
| --- | --- | --- | --- |
| Relative image link | Reproducible state | Describe inspected details and any anomaly or uncertainty first | Then assign: Pending / No concern observed / Confirmed issue / Needs clarification |

Every saved image must have an entry, including extra crops or recaptures. Before finishing, reconcile the image files with the index. Do not claim complete visual review while entries remain pending. “No concern observed” describes this inspection, not a guarantee that the page has no defects.
## Triage and user involvement

- **No concern observed:** record the result in the local index; no human review request.
- **Confirmed issue:** create or update a report in [reports/bugs](../../../../reports/bugs/README.md), with reproduction, visible impact and evidence. Report it in the task result; no user confirmation is needed to establish an already verified defect.
- **Needs clarification:** record the suspected issue and what was checked. Follow the bug guide for suspected defects. Send only the relevant screenshot(s), the specific uncertainty and a focused question to the user. Batch related questions and continue work that does not depend on the answer. If there is no established design requirement, label the expectation as an assumption.

Adapt the bug template's endpoint/request fields to the UI route and browser actions for UI findings. Bug reports remain tracked Markdown; embed relevant inspected screenshots inline with `![descriptive state and viewport](image-path)` so they render without an extra click. Use an absolute local image path when needed by the local Markdown viewer, and keep a link to the complete review index. State that images are ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence. Include enough textual reproduction detail for teammates to investigate without those files. Do not commit screenshots to make a report portable.

The task result should link to the complete local review index for optional browsing and summarize inspected coverage, confirmed bugs, unresolved questions and any pending images. Display or request review of only the unresolved screenshots. Do not ask for approval of the whole gallery or block all test generation on visual sign-off. If an unresolved question affects a particular test's expected result, defer that assertion and continue with verified scenarios.

## Bug tags and filenames

Follow [the project classification guide](../../../../reports/bugs/README.md) for `[S][T]-BUG-NNN-short-description.md`, severity impact definitions and allowed categories. Keep the stable ID, match filename severity/category to report fields, and record additional lowercase tags in the report. Choose the most specific impact category (for example accessibility for keyboard barriers); UI is not a catch-all for every browser finding. Reclassification requires updating the filename, index and all links together. Keep status separate from severity; do not treat suspected as low severity or a proposed optimization as a confirmed performance defect.

## Explain impact before selecting severity

Write `Severity rationale` immediately after the bug title, before classification or selection of the filename tag. Describe affected users/journey, observed consequence, trigger/scope, persistent effects, viable recovery and unknowns without starting from a severity label. Select the level afterward using the project classification guide. Assess impact on the affected group: a mouse workaround does not resolve keyboard exclusion. An axe impact score, visual difference or suspected worst case is not automatically the report severity. Separate observed behavior from possible consequences and confidence/status from severity. Compare analogous findings, preserve explicit user decisions, and update filenames/index/references with a reassessment; do not claim new execution from document review.
