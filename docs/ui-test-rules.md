# UI test rules

These are initial conventions to review and refine as UI coverage grows.

- Explore the real UI and its behavior before writing tests; use Playwright CLI when useful. Verify selectors and messages against the target application.
- Prefer existing `data-testid` attributes with `getByTestId`. If no suitable test ID exists, use a stable accessible role or label; avoid brittle CSS and positional selectors.
- Put reusable page interactions and locators in `pages/`; model shared interface areas as components in `pages/components/` and compose them into page objects (for example, `loginPage.toast.expectDescription(...)`). Keep the shared base page small and add abstractions only when useful.
- Keep scenarios and expected outcomes explicit in tests. Assert visible, meaningful feedback (including inline validation and toast messages) and the destination page when relevant; a URL alone rarely proves the behavior.
- Use Playwright's locator actions and auto-retrying assertions instead of fixed waits. Keep tests independent and safe to run in parallel; create and clean up any test data they own.
- Use the configured `baseURL` and environment-backed credentials. Never commit secrets or rely on state left by another test.
- Run the affected UI tests against the intended application and report failures or environment limitations. Investigate failures before changing expected behavior.

## Aspects to examine

Assess each relevant view across these complementary aspects; record coverage and
limitations rather than treating a checklist as proof of quality:

- **Functional:** main journeys, boundaries, validation, navigation, state,
  backend integration, loading and errors.
- **Accessibility:** accessible names and labels, keyboard navigation and visible
  focus, error associations, semantic structure, contrast, zoom/reflow, and
  assistive-technology behavior where feasible. Use the applicable accessibility
  standard and product requirements as the basis; do not claim conformance from
  a few checks. Follow [W3C's preliminary checks](https://www.w3.org/WAI/test-evaluate/preliminary/).
- **Usability:** whether the task, instructions, feedback and recovery are clear;
  assess effort, confusing wording and mobile interaction. Ask product/design
  when a concern depends on an unstated expectation.
- **Visual:** inspect screenshots and the live page at relevant viewports and
  states for clipping, overlap, hierarchy, alignment, readability, consistency
  and responsive layout. Compare with approved designs when available. Record
  subjective improvements as recommendations or questions, not proven defects.

Automate stable accessibility behaviors alongside functional tests, including
accessible names, keyboard interaction and meaningful error associations where
applicable. Use the separate axe proof of concept in `tests/accessibility/` for common
machine-detectable violations on important states; run it with `npm run test:a11y`.
Review findings and known defects explicitly instead of hiding or weakening them.
The general `npm test` also discovers these tests; `npm run test:ui` runs the
functional UI directory separately. [Playwright's accessibility guidance](https://playwright.dev/docs/accessibility-testing)
explains that automated checks do not replace manual or assistive-technology
assessment. A screenshot baseline can help detect visual regressions after a
stable, approved reference exists; inspect visual quality separately.

Label UI findings `functional`, `accessibility`, `usability` and/or `visual` as
described in [bug reports](../bugs/README.md). Link related reports and preserve
shared bug numbering.

## White-box analysis and integration

Before exploring or automating a view, inspect the relevant frontend source in
[the React repository](https://github.com/slawekradzyminski/vite-react-frontend).
Record the repository revision and whether it matches the deployed build; use a
local checkout if available. Trace components, routes, validation, state and
error handling, shared UI components, accessibility, and existing tests. Review
React code for risks such as incorrect state/effect handling, unsafe rendering,
races, and error paths; turn evidence-backed risks into focused exploratory
charters. Keep source-only observations separate from runtime-confirmed behavior.

Trace the view's HTTP requests and responses through the frontend client and,
where relevant, the backend implementation and contract. Compare browser
network observations and user-visible outcomes with those expectations. Check
validation boundaries, authentication and authorization, loading, error and retry
paths when relevant. Sanitize evidence and use disposable data. Do not assume
that a UI symptom originates in the frontend or that every server error is a
backend defect; establish the responsible layer where possible.

Report confirmed frontend/UI defects in `bugs/ui/` with evidence appropriate to the finding.
Do not ignore defects found in the backend during UI work: use the project-local
[api-testing skill](../.agents/skills/api-testing/SKILL.md) for API exploration,
backend bug reports and any API tests, and report them under `bugs/api/`. Link
related reports instead of duplicating one root cause. Capture uncertain behavior
as a question or investigation lead, and record source revision, runtime build,
reproduction and evidence; never present a static suspicion as a confirmed bug.

## Given–When–Then and setup

Structure each scenario with `// given`, `// when` and `// then` comments, as in
the API tests. Given prepares the data, page objects and starting conditions;
shared starting-page navigation can live in `beforeEach`. When performs the UI
action under test. Then contains assertions for its observable outcome.

Create or arrange server-side test data and state through the HTTP layer, using
the existing API clients and Playwright request context, rather than driving
unrelated setup journeys through the UI. Clean up data owned by the test through
HTTP as well. Open the starting page in the browser as needed, and exercise the
UI in When. Existing read-only accounts or purely local input data do not require
an artificial HTTP setup request. Use UI setup only when it is itself necessary to
the behavior being tested.

## Exploratory testing and viewport coverage

Explore each relevant view using these three targets (dimensions in CSS pixels):

| Target | Viewport (width × height) |
| --- | --- |
| Phone | 402 × 874 portrait, approximating an iPhone 18 Pro-sized layout |
| Tablet | 820 × 1180 portrait and 1180 × 820 landscape, approximating an 11-inch iPad Air-sized layout |
| Desktop | 1920 × 1080 |

Use Playwright CLI with its default Chromium browser, emulating the phone and
tablet viewport and touch behavior. The existing Playwright test configuration
also uses Chromium with the Desktop Chrome profile; it does not automatically
run the tests at all three exploratory targets. Chromium emulation tests layout
and interactions at these sizes; it does not reproduce iOS Safari or a physical
device. Record the actual browser and viewport used.

For each changed view, perform a time-boxed exploratory session before or alongside
automation. Start with the main user journey at one size, then vary viewport and
orientation, input boundaries, validation, navigation, keyboard access and visible
feedback according to risk. Use Playwright CLI snapshots for navigation and
locators; inspect viewport and full-page screenshots when layout matters, and
record console errors and relevant network failures. Check for clipping,
horizontal overflow, readable feedback, reachable controls and focus order.
Use disposable data and avoid secrets in evidence. Record environment, browser,
viewport, scenarios, observations, untested areas and links to findings. Separate
confirmed defects from product questions, investigate repetitions and report
minimal reproducible evidence using `bugs/TEMPLATE.md`. Screenshots are
recommended for visible UI and usability issues when useful; for other issues
choose the most informative evidence. Save screenshots in `bugs/ui/screenshots/`
with the bug ID in the filename, and sanitize all evidence.

Automate stable, valuable regressions, not every exploratory step;
run affected automated tests and investigate failures without weakening expected
behavior merely to make them pass.
