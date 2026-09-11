# Write readable UI tests

Read `AGENTS.md` for required structure, selectors, lifecycle, viewport and commands. Inspect `pages/README.md`, neighboring specs, page objects and `fixtures/ui/pages.ts` before implementing.

## Keep business intent visible

Specs describe preparation, the user action and the observable outcome. Keep scenario-specific inputs and expected messages visible at the call site. Put locators, browser mechanics and assertions in the relevant page or component. For example, an invalid-login scenario fills credentials in given, calls `loginPage.submit()` in when, and calls `loginPage.toast.expectError('Invalid username/password')` in then.

Prefer a small live-backend suite covering meaningful user journeys and one representative client-validation case. Detailed field boundaries belong at lower layers. Do not add keyboard-only, toast-dismissal, mocked-loading or every explored error case by default. Exploration is broader than automation. Keep work on the requested screen; navigating to Home does not authorize a Home test suite.

## Page objects and components

- `tests/ui/<screen>.ui.spec.ts` owns scenarios for that screen. Navigation checks may use a destination object without expanding its coverage.
- `pages/<screen>-page.ts` owns screen-specific locators, actions and explicit outcome assertions.
- `pages/base-page.ts` owns common route/root mechanics. Keep screen-specific headers and toasts out of the base class.
- `pages/components/` owns reusable widgets and their assertions. Compose them into relevant pages; retain visible component calls such as `loginPage.toast.expectError(message)`.
- `fixtures/ui/pages.ts` constructs test-scoped page objects. Keep scenario navigation/setup apparent in given. Use existing API clients and disposable fixtures for supporting state when appropriate, without replacing the UI action under test.

Name assertions precisely: `expectUrl()` checks navigation; title, authentication and toast checks are separate outcomes. Avoid vague `expectOpened()` methods that hide multiple conditions. Actions should not silently assert outcomes. Use Playwright auto-waiting and retrying assertions; avoid redundant readiness/visibility preflights and arbitrary sleeps. A visible-state assertion remains useful when visibility itself is the intended outcome.

Prefer stable test IDs and scope ambiguous locators to their page/component. Generated toast IDs require a stable child or semantic locator; inspect the live DOM rather than guessing selectors. Avoid deep inheritance, generic workflow frameworks and wrappers that obscure the action.

## Reliability and scope

Use isolated browser contexts and test-scoped data. Read credentials and base URLs from project configuration. Do not mutate shared demo accounts; use disposable accounts for stateful flows and clean up dependent data after failure. Verify actual logout/session semantics before introducing broad revocation or extra cleanup calls.

Assert meaningful positive outcomes and precise negative messages. Do not encode known defects as expected behavior, weaken checks to pass, or add skipped/expected-failure cases for open findings by default. Keep proposed regressions in bug reports until behavior is agreed and fixed.

For each selected journey, assert its relevant visible consequences as well as persisted state: for example, a cart action can change the product card, shared header count and notification. A small scenario count is not a reason to omit those outcomes. Keep component assertions explicit in the scenario, and use multi-item state when a counter must aggregate across items.

Live integration checks and controlled failure experiments establish different things. Label injected failures; introduce permanent mocks only when the requested coverage needs them. Use the configured desktop viewport without adding mobile/tablet projects. Finish with [review and improvement](review-and-improvement.md).
