# UI automation

The current Playwright configuration runs automated tests in a single Chromium
project using the Desktop Chrome device profile (currently 1280 × 720 CSS pixels). It
does not automatically run the three exploratory viewport targets. Check
`playwright.config.ts` for the current configuration.

Use `tests/ui/auth/login.ui.spec.ts` as the style reference: short, explicit scenarios
with one action and a clear user-visible outcome. Keep interactions in page
objects. Prefer representative coverage over exhaustive field/boundary matrices;
avoid generated test loops, request counters, and mock orchestration unless the
scenario specifically needs them.

Follow the [shared automation and verification rules](../../shared/testing.md)
for representative coverage, known defects and future regressions.

- Prefer existing `data-testid` attributes with `getByTestId`. If no suitable test ID exists, use a stable accessible role or label; avoid brittle CSS and positional selectors.
- Put reusable page interactions and locators in `pages/`; model shared interface areas as components in `pages/components/` and compose them into page objects (for example, `loginPage.toast.expectDescription(...)`). Keep the shared base page small and add abstractions only when useful.
- Keep exceptional mobile regressions in `tests/ui/mobile/`, with viewport/touch
  configuration local to those tests. Do not duplicate the desktop suite on
  mobile by default. Use a separate mobile header component in
  `pages/components/mobile/` when its controls and interaction flow differ.
  Share unchanged page content; compose the appropriate header in the tests
  instead of coupling the shared homepage to a desktop header.
- Keep scenarios and expected outcomes explicit in tests. Assert visible, meaningful feedback (including inline validation and toast messages) and the destination page when relevant; a URL alone rarely proves the behavior.
- Use Playwright's locator actions and auto-retrying assertions instead of fixed waits. Keep tests safe to run in parallel under the shared data-ownership rules.
- Use the configured `baseURL` and environment-backed credentials.
- Run the affected UI tests against the intended application, following the shared verification rules.

Organize UI specs by area under `tests/ui/` (for example `auth/`, `home/`,
`navigation/` and `products/`), with area-specific fixtures beside their specs.
Keep shared authenticated fixtures in `tests/ui/fixtures.ts` and focused mobile
scenarios in `tests/ui/mobile/`.

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

## Verifying saved state through the API

For UI actions that change server state, assert meaningful user-visible feedback
and verify the relevant saved state through a separate API read when practical.
Keep the action under test in the UI; reuse existing HTTP clients and the same
test user's identity for verification. Keep HTTP access out of page objects.

- Assert the read's status and the business outcome: the correct entity, changed
  fields, quantities, totals or absence after deletion. A successful write
  response or toast alone does not establish the resulting saved state.
- For rejected writes, verify that the relevant pre-existing state remains
  unchanged. If a request is intercepted to simulate failure, keep the
  verification read real so it can detect unintended changes.
- Keep API assertions focused on the scenario; do not duplicate the full API
  contract suite or replace UI assertions. Local filtering, sorting and other
  behavior without a server mutation do not need extra API reads by default.
- Use bounded polling only when the application's contract is eventually
  consistent; do not add fixed sleeps or retries to conceal a defect.

See `tests/ui/products/products.ui.spec.ts` for cart add/update/removal and failed-update
recovery examples, with the same-user HTTP client in `tests/ui/products/products.fixtures.ts`.
These reads confirm API-visible saved state, not database durability beyond the
application's contract.

## Authenticated browser setup and ownership

Import `test` and `expect` from `tests/ui/fixtures.ts` for scenarios that start
signed in. Its test-scoped `authenticatedUser` supplies a freshly generated
regular client account. It registers through `ApiTestContext.registerUser`, logs
in through `AuthClient` using Playwright's standard `request` fixture, and calls
`context.setStorageState(...)` on the standard browser context before yielding
it to the test. Use the configured `baseURL` origin. Playwright manages both
contexts' lifecycles; no custom HTTP context or `request` override is needed.

Match the frontend's actual persistence contract: localStorage `token`,
`refreshToken`, and `clientSessionId` (the login response's
`X-Client-Session-Id` when supplied). Recheck `authStorage.ts`, the login flow,
and HTTP interceptors when that contract changes. Do not store a user/role object
or fake tokens; the UI loads identity and roles through `/api/v1/users/me`.
Apply authentication in the `context` fixture instead of overriding the
`storageState` option with setup that depends on `request`; this keeps API setup
out of the configuration it needs to consume. Do not use an init script that restores tokens
after navigation: that can undo logout and conceal session bugs.

Every test owns its user; do not share accounts, tokens, saved authentication
files, or worker/global login state. Reuse the inherited API fixture's tracking
and finally-based cleanup, including when login, browser setup, or assertions
fail. Never delete or modify pre-existing accounts. Use administrator credentials
only for operations requiring them (such as cleanup), not as the default UI
identity. Add an explicit role-specific fixture only when its scenario needs it.

For conditional navigation, derive a role/state matrix from the frontend source
and verify both presence for authorized users and absence for unauthorized
users after identity has loaded. A hidden-link assertion alone does not cover
the authorized branch or prove route/API authorization.

`adminTest` in `tests/ui/fixtures.ts` overrides only `loginCredentials` for a
fresh API login to the configured administrator. The public API cannot create
or promote a disposable administrator, so use this fixture only for read-only
admin journeys. Do not mutate/delete the shared administrator or log it out
(logout revokes its other refresh sessions). Its lazy credential override avoids
creating an unused client user. Keep all ordinary client cases on `test`, with
their existing per-test ownership and cleanup. Never fake roles in storage or
mock `/me` to claim real role integration coverage.

Login, registration, and logged-out scenarios should import the plain Playwright
test or `tests/api/fixtures.ts` when they need HTTP data setup; importing the
authenticated UI fixture would sign them in before their action. Test successful
UI login using a disposable account and the existing HTTP ownership lifecycle.
Assert identity using test-owned names/email, meaningful destination content,
and session behavior after reload/logout as appropriate. Keep logged-in and
logged-out headers as distinct components in `pages/components/`.

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

