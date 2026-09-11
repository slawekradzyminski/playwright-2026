# UI page objects

Automated paths are **desktop-only, 1920 × 1080**. Run `npm run test:ui`. Exploratory screenshot review still uses desktop/tablet/mobile; see [the workflow](../.codex/skills/ui-testing/references/exploration.md).

- `BasePage` owns the route and root locator; it contains no screen-specific components.
- Each screen owns its locators, actions and assertions. Specs contain scenarios and call these methods.
- `LoggedOutHeader`, `AuthenticatedHeader` and `Toast` are composed into the screens that need them. They own their own assertions. The authenticated header currently models the automated desktop flow.
- `fixtures/ui-fixture.ts` constructs test-scoped objects. Each scenario opens login in its given section. Browser contexts are isolated and closed by Playwright.
- Destination objects currently verify the navigation outcome only. Expand them when those screens are explored and automated; put their scenarios in separate screen-specific specs.
- Stable data-testid selectors are preferred. Toast containers have generated IDs, so the component scopes a semantic list item by its stable description child.
- Page actions do not assert outcomes implicitly. Actions use Playwright auto-waiting; explicit `expect...` methods verify outcomes rather than preflight readiness.
- Keep UI coverage focused on business flows with the live backend. Use one representative client-validation case; detailed field boundaries belong in lower-level tests. Do not add separate keyboard, toast-dismissal or mocked loading cases by default.

Known accessibility and duplicate-request defects are documented in [the UI register](../docs/bugs/ui/README.md); the suite does not assert those defects as expected behavior.

The current login scenarios use the configured demo admin. HomePage only verifies the successful-login destination; Home screen scenarios are outside the current scope.
