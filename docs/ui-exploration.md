# UI exploration workflow

Trial workflow for UI exploration before test automation. Use the `playwright-cli` skill for browser operations and [AGENTS.md](../AGENTS.md) for test conventions. Keep this as a project document while the workflow is being evaluated.

Explore functionality and rendered appearance together. Save screenshots locally, inspect every captured image, and ask the user to review only unresolved visual findings. This workflow uses no screenshot baselines, pixel comparisons, `toHaveScreenshot` assertions or Docker requirement. Screenshots are exploration evidence, not visual regression tests.

## Viewports

These viewport checks apply to exploration only. Automated functional UI tests run once on the configured desktop viewport. Do not multiply functional scenarios across mobile/tablet/desktop sizes or override individual functional tests to mobile sizes.

Use these defaults for each distinct page/layout in scope. Dimensions are browser viewport width × height in CSS pixels, not physical screen resolutions.

| View | Viewport | Purpose |
| --- | --- | --- |
| Mobile width | 360 × 800 | Narrow layout, wrapping and navigation |
| Tablet width | 768 × 1024 | Intermediate layout and column transitions |
| Desktop | 1440 × 900 | Wide layout and content alignment |

These are practical sampling choices, not a market-share ranking or a device support guarantee. Current [web.dev guidance](https://web.dev/articles/responsive-web-design-basics) recommends choosing breakpoints from content. Check immediately below and above relevant layout transitions observed in the UI or frontend CSS. Add widths such as 320px, landscape orientation or another browser when the feature, a finding or known audience needs them; record additions and coverage gaps.

Resizing checks responsive layout. For touch, mobile viewport metadata or mobile-specific behavior, also use an appropriate device/mobile context and record its actual settings. [Playwright emulation](https://playwright.dev/docs/emulation) distinguishes viewport, user agent, device scale factor, mobile mode and touch settings. A resized desktop browser does not establish real-device or Safari coverage.

## Explore, capture and inspect

1. Establish the feature's expected behavior from available requirements and application context. Note assumptions. Prepare disposable data through the existing API clients when needed.
2. Explore the initial view and relevant states: validation and server errors, success feedback, menus/dialogs, loading or empty content, and long content where applicable. Capture meaningful visual changes rather than every click. Check the initial layout and primary interaction at all three default widths; check additional states at widths where wrapping, layout or interaction could change. Record what was actually covered.
3. Before capturing a stable state, wait for the intended UI, fonts and images to render and finite entrance animations to finish. If a capture catches an animation accidentally, retain and label it as transient, then capture the settled state. Capture transient states deliberately while visible. Do not hide or restyle suspicious content to make the screenshot look correct.
4. Capture the viewport first. Scroll through longer pages and capture relevant lower sections; add a full-page image or component crop when useful. Preserve surrounding context for suspected overlaps, clipped dialogs or fixed elements.
5. Open and visually inspect every saved screenshot with the available image-viewing tool. File existence, an accessibility snapshot or a successful click does not count as image review. Inspect full-page images at readable scale or in sections. Record a result for each image; leave images that could not be inspected explicitly pending.
6. Investigate suspected problems in the browser: reproduce them, inspect the DOM/layout, try a nearby width and consult requirements. Distinguish a usability defect from a subjective design preference. Report findings using the triage below, then automate verified behavior. Continue independent work while a visual question remains unresolved.

During image review, check clipped or overlapping text, wrapping, unexpected horizontal overflow, alignment and spacing consistency, missing images/icons, readable feedback, dialogs and overlays, navigation and visible focus states where exercised. Support precise geometry or contrast claims with DOM measurements or an appropriate tool. A screenshot alone cannot establish keyboard behavior, exact contrast compliance or complete accessibility.

## Visual review before assigning a result

Review appearance separately from interaction results. A successful click or passing functional test does not establish that the control or surrounding layout looks correct. For each image, make two passes: first inspect the overall composition and boundaries between regions, then compare related controls and text within each region.

Use the applicable checks below and record concrete observations; do not mechanically mark every item as passed.

| Area | Required comparison |
| --- | --- |
| Related controls | Compare label alignment, left/right insets, icon placement, widths and spacing within each group. Investigate an outlier such as centered Logout among left-aligned account links; different HTML element types do not explain away a visible inconsistency. |
| Content containment | Inspect text and icons inside cards and panels, including their right and bottom edges. No document-level horizontal overflow does not rule out content clipped by an ancestor. Measure the affected container when clipping is suspected. |
| Menus, dialogs and sticky elements | Compare closed and open states at the same viewport and scroll position. Inspect the boundary with background content: partially hidden headings, text appearing to continue the menu, overlapping actions and unclear grouping. For sticky navigation on a long page, check opening near the top and near the footer. |
| Intent and evidence | Distinguish what is visibly different from why it happens and whether it is intended. Use requirements, neighboring controls and browser measurements as evidence. Source classes suggest intent or cause but do not prove deployed behavior. Intentional overlays can obscure content; do not automatically classify every overlap as a defect. |

If a detail looks suspicious, investigate it before assigning “No concern observed.” If intent remains unclear, record “Needs clarification” and a suspected bug with the specific uncertainty; do not silently dismiss it as subjective. Ask only about the unresolved detail and continue independent work.

For each image, first write a concise, evidence-based observation of what was actually inspected, then assign the review result. Present the observation before the result in the report; do not start with “No concern observed” and add a justification afterward. Describe visible facts and relevant measurements, not private internal reasoning. For example: “Account labels share the same left edge; menu/footer boundary remains clear in the open state.” Generic phrases such as “looks fine” or “consistent spacing” without naming the inspected region are insufficient. Do not prefill positive results across the screenshot list. Functional outcomes belong in the scenario results, not as justification for visual approval.

Before completing the review, revisit screenshots containing open menus/dialogs, feedback overlays or suspected clipping. Check that every observed anomaly has either a bug reference, an explicit unresolved question, or evidence explaining why it is not a defect. Keep uninspected areas and untested states as coverage gaps; do not imply they passed.

## Console and API evidence

Start observation before the first navigation or action. Collect browser console warnings/errors, uncaught page errors, failed requests, and **all API requests/responses**, including successful responses. A request failure is a transport failure; HTTP 400/500 responses must also be reviewed explicitly. Correlate each entry with a named scenario and the UI action, then inspect method, route, sanitized payload, status, response body, request count and resulting UI feedback against requirements. Check that client-side validation and navigation do not unexpectedly submit data. Report unexpected errors even when the UI assertion passes; do not treat an expected duplicate-account 400 as a defect.

Use [the CLI observer](../scripts/ui-exploration-observer.js) with a dedicated browser session:

```bash
playwright-cli -s=exploration run-code --filename=scripts/ui-exploration-observer.js
playwright-cli -s=exploration run-code "async page => { page.__uiExploration.scenario = 'empty form'; page.__uiExploration.mode = 'live'; }"
# Perform the scenario, then label the next one before its actions.
playwright-cli -s=exploration --raw run-code "async page => await page.__uiExploration.stop()" > reports/exploration/ui/<run>/browser-events.json
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
- **Confirmed issue:** create or update a report in [reports/bugs](../reports/bugs/README.md), with reproduction, visible impact and evidence. Report it in the task result; no user confirmation is needed to establish an already verified defect.
- **Needs clarification:** record the suspected issue and what was checked. Follow the bug guide for suspected defects. Send only the relevant screenshot(s), the specific uncertainty and a focused question to the user. Batch related questions and continue work that does not depend on the answer. If there is no established design requirement, label the expectation as an assumption.

Adapt the bug template's endpoint/request fields to the UI route and browser actions for UI findings. Bug reports remain tracked Markdown; embed relevant inspected screenshots inline with `![descriptive state and viewport](image-path)` so they render without an extra click. Use an absolute local image path when needed by the local Markdown viewer, and keep a link to the complete review index. State that images are ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence. Include enough textual reproduction detail for teammates to investigate without those files. Do not commit screenshots to make a report portable.

The task result should link to the complete local review index for optional browsing and summarize inspected coverage, confirmed bugs, unresolved questions and any pending images. Display or request review of only the unresolved screenshots. Do not ask for approval of the whole gallery or block all test generation on visual sign-off. If an unresolved question affects a particular test's expected result, defer that assertion and continue with verified scenarios.

## Optional accessibility checks

Use axe when an explored state involves forms, dialogs, navigation or suspected accessibility issues and an axe integration is available. It adds useful checks for accessible names and some contrast failures that image review may miss. Scan the actual relevant state after opening a dialog or triggering validation; save results in the same ignored run directory. Record whether axe ran, its scope/version, findings and any checks requiring manual review. A skipped scan must not be reported as a pass.

Treat scan findings as evidence to investigate and report, not as design approval. Continue screenshot inspection and relevant keyboard exploration. [Playwright's accessibility guidance](https://playwright.dev/docs/accessibility-testing) documents `@axe-core/playwright` and the limits of automated checks. This initial workflow does not install axe or add accessibility test assertions; adoption in the suite can follow exploration of the actual findings.

Sources reviewed on 2026-09-08. Revisit the viewport sample when product requirements or observed usage justify it.
