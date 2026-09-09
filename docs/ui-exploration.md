# UI exploration workflow

Trial workflow for UI exploration before test automation. Use the `playwright-cli` skill for browser operations and [AGENTS.md](../AGENTS.md) for test conventions. Keep this as a project document while the workflow is being evaluated.

Explore functionality, rendered appearance, accessibility, user experience and performance together. Save screenshots locally, inspect every captured image, and ask the user to review only unresolved findings or expectations. This workflow uses no screenshot baselines, pixel comparisons, `toHaveScreenshot` assertions or Docker requirement. Screenshots are exploration evidence, not visual regression tests.

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

## Required accessibility checks

Include accessibility in every UI exploration, before automating the verified scenarios. Check each distinct page and relevant interactive state, including open menus/dialogs, validation feedback, loading, errors and empty results. Apply checks to the controls present; record a reason when a check is not applicable. A successful mouse interaction or accessibility snapshot alone does not establish accessibility.

| Area | Required exploration |
| --- | --- |
| Keyboard operation | Complete the primary journey using the keyboard. Check Tab/Shift+Tab order and access to every action, including clickable cards, images and custom controls. Exercise Enter/Space and arrow keys where appropriate. Check for unreachable actions and keyboard traps. |
| Focus | Inspect visible focus and whether sticky elements or overlays obscure it. Check focus placement when opening a dialog/menu and restoration when closing it, including Escape where applicable. |
| Names and structure | Inspect rendered roles, accessible names, form labels, headings, landmarks and image alternatives. Icon-only controls need meaningful names; related controls must be distinguishable. Check that selected, expanded, required and invalid states are exposed where relevant. |
| Feedback | Check that validation identifies the affected field and explains recovery. Inspect how loading, errors and success feedback are exposed to assistive technology; do not infer screen-reader announcements from visible text alone. Record whether actual screen-reader testing was performed. |
| Readability and reflow | Check text at 200% browser zoom and at the narrow exploration viewport for lost content or unusable controls. Inspect text/control contrast with tooling; record measured evidence for suspected failures. Resizing alone does not establish zoom coverage. |

Run an axe scan on each distinct page and materially different state in scope, using an existing integration or an exploration-only axe setup when none is installed. Missing integration is a setup task, not a reason to silently skip accessibility. Record the tool/version, rules or tags used, scanned state, violations and incomplete checks; save sanitized results in the ignored run directory. If installation or execution is blocked, record the exact limitation and mark automated accessibility review incomplete, continue the manual checks and independent work, and disclose the gap in the task result. Do not report an unavailable or skipped scan as passed.

Investigate scan findings in the rendered UI, triage confirmed and suspected issues using the same bug workflow, and manually review applicable incomplete checks. A clean scan does not establish complete accessibility or WCAG compliance. [Playwright's accessibility guidance](https://playwright.dev/docs/accessibility-testing) describes axe integration and the limits of automated checks. Exploration tooling does not automatically require adding axe assertions to the regression suite; automate verified behavior according to repository test conventions.

## Required user experience review

For every explored feature, assess whether a user can discover the intended action, understand the current state, complete the task and recover from mistakes. Evaluate this separately from whether the implementation technically works. Use realistic journeys and edge cases, including long content, empty results and unexpected input, at the relevant viewport sizes.

| Area | Required questions and probes |
| --- | --- |
| Discoverability and hierarchy | Can users find primary actions, search and content without unnecessary scrolling or opening unrelated controls? Does secondary content, such as a long category list, push the main task out of view? |
| Input expectations | Try pasted input, surrounding spaces, mixed case and relevant punctuation. Compare behavior with field wording and user expectations; distinguish an established requirement from an assumption. |
| State and consistency | Are counts, selected filters, sorting, labels and enabled/disabled actions consistent with the displayed data? Is it clear why an action is unavailable? Check combinations, not only isolated controls. |
| Feedback and recovery | Is the result of an action clear and timely? Can users correct invalid input, clear filters, recover from empty/error states and retry safely? Do notifications hide the next action or disappear before they can be understood? |
| Navigation and effort | Check back navigation and state retention against the journey's needs. Look for avoidable repeated input, unnecessary steps, ambiguous click targets and actions with surprising side effects. |

When behavior seems wrong or unnecessarily difficult, reproduce it and record the user goal, exact action, observed friction, impact and expected alternative with its source. Do not dismiss a concern merely because it matches the implementation or no design specification exists. Report a confirmed defect directly. If intended behavior remains uncertain, create a suspected bug, mark “Needs clarification” and ask the user a focused question with relevant evidence. Use screenshots for visual concerns and action/result evidence for behavioral concerns. Continue independent work; defer only assertions whose expected result depends on the answer. Update the finding when the user clarifies the requirement.

Include separate accessibility and UX summaries in `review.md`: checks actually performed, states/viewports, concrete observations, evidence, bug references, unresolved questions and coverage gaps. Use the same evidence-first result labels as visual review, but keep scan results, manual accessibility checks and UX judgments distinct. Before completing exploration, ensure every suspicious accessibility or UX observation has a bug reference, an explicit question or evidence explaining why it is not a defect. Summarize material findings and incomplete checks in the task result.

## Required performance and scalability review

Include a lightweight performance review in every exploration. Measure the primary page load and data-dependent interactions under normal use, including search, filtering, sorting and navigation where applicable. Passing functional assertions does not establish acceptable speed. This review is not a load test and does not require generating a large dataset or concurrent traffic.

| Area | Required evidence and questions |
| --- | --- |
| User-visible delay | Measure from navigation/action to usable content or completion feedback. Record the completion condition. Does the page remain responsive, show useful loading feedback and prevent accidental duplicate submissions? |
| Request timing | Record method, route, status and duration for relevant requests. Where available, distinguish time to first byte, response download and subsequent rendering. Do not label browser-observed duration as backend processing time without server evidence. |
| Repeatability | Record an initial load separately from a small set of repeat observations (normally 3–5). State sample count, individual timings and range/median, cache conditions, dataset size and known environmental factors. Do not present a small sample as a production percentile or SLA result. |
| Payload and request count | Record returned record count, payload/transfer size when available and requests per action. Investigate duplicate fetches, retries, request waterfalls and unexpectedly fetching full datasets for a small visible result. Distinguish intentional polling or retry policy from unexplained traffic. |
| Growth and pagination | For lists, check whether API results are bounded by pagination/limits and whether the UI actually uses them. Consider server-side search/sort/filtering, image loading and rendering cost as data grows. Missing pagination is a scalability concern to assess, not automatically a proven defect or the cause of current latency. |

Use browser network/performance evidence alongside the existing observer. Its timestamps alone do not capture time until usable UI or separate server processing from transport/rendering; supplement them with explicit measurements. Save sanitized timings and summaries in the exploration directory, label simulated delays separately and record measurement gaps. Do not silently run stress tests or create large shared datasets as part of this checklist.

Compare measurements with an agreed performance target when one exists. Without a target, flag repeatable multi-second waits on small datasets as suspected problems worth investigation; do not invent a universal pass/fail threshold or infer a cause such as a missing database index. Record the measured user impact, competing explanations and the next diagnostic step. Ask a focused question when an expected latency or intended scale materially affects classification, while continuing independent work.

Report a demonstrated regression or requirement violation through [the bug workflow](../reports/bugs/README.md). Use a suspected bug when observed behavior may be defective but evidence or expectations remain incomplete. Record a proposed optimization or future scalability concern in [improvements](../reports/improvements/README.md), with evidence, expected benefit, unknowns and a validation plan. Link related records rather than reporting the same issue twice. User-reported latency must remain labeled as user-reported until measured.

Include a performance summary in `review.md`: actual measurements, dataset and cache conditions, request counts, pagination findings, bugs/improvements and untested scaling assumptions. Keep functional automation free of arbitrary timing assertions; add performance budgets only when their threshold and measurement environment are established.

Sources reviewed on 2026-09-08. Revisit the viewport sample when product requirements or observed usage justify it.
