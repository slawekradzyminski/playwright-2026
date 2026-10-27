# UI automation

The current Playwright configuration runs automated tests in a single Chromium
project using the Desktop Chrome device profile (currently 1280 × 720 CSS pixels). It
does not automatically run the three exploratory viewport targets. Check
`playwright.config.ts` for the current configuration.

- Prefer existing `data-testid` attributes with `getByTestId`. If no suitable test ID exists, use a stable accessible role or label; avoid brittle CSS and positional selectors.
- Put reusable page interactions and locators in `pages/`; model shared interface areas as components in `pages/components/` and compose them into page objects (for example, `loginPage.toast.expectDescription(...)`). Keep the shared base page small and add abstractions only when useful.
- Keep scenarios and expected outcomes explicit in tests. Assert visible, meaningful feedback (including inline validation and toast messages) and the destination page when relevant; a URL alone rarely proves the behavior.
- Use Playwright's locator actions and auto-retrying assertions instead of fixed waits. Keep tests independent and safe to run in parallel; create and clean up any test data they own.
- Use the configured `baseURL` and environment-backed credentials. Never commit secrets or rely on state left by another test.
- Run the affected UI tests against the intended application and report failures or environment limitations. Investigate failures before changing expected behavior.

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

## Accessibility automation

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

