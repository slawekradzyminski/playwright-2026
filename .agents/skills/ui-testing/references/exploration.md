# UI exploration

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

## Exploratory testing and viewport coverage

Explore each relevant view using these three targets (dimensions in CSS pixels):

| Target | Viewport (width × height) |
| --- | --- |
| Phone | 402 × 874 portrait, approximating an iPhone 18 Pro-sized layout |
| Tablet | 820 × 1180 portrait and 1180 × 820 landscape, approximating an 11-inch iPad Air-sized layout |
| Desktop | 1920 × 1080 |

Use Playwright CLI with its default Chromium browser, emulating the phone and
tablet viewport and touch behavior. Chromium emulation tests layout
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
viewport, scenarios, observations, untested areas and links to findings in the
final response and relevant bug reports. Do not create standalone
exploration/session reports, evidence documents or increment summaries in
`docs/` or elsewhere (for example, date-stamped registration reports) unless
the user explicitly requests such a document. This also applies when exploring
as part of test implementation. Keep `UI-TEST-PLAN.md` a current coverage
inventory, not a session log. Use [reporting](reporting.md) to triage and document
findings; retain useful sanitized reproduction artifacts with the bug reports.

Automate stable, valuable regressions, not every exploratory step;
run affected automated tests and investigate failures without weakening expected
behavior merely to make them pass.

