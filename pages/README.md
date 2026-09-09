# Page objects

`BasePage` holds the Playwright page. Choose the base matching the page's authentication state:

- `LoggedInPage` composes `LoggedInHeader` for Home, Profile and other authenticated destinations.
- `LoggedOutPage` composes `LoggedOutHeader` for Login and Register.

Access shared navigation through `pageObject.header`. Keep form controls and in-page shortcuts in the concrete page object, so tests distinguish navbar navigation from content navigation. Header locators are scoped to the navigation container.

Each concrete page's `assertLoaded()` verifies its URL and identifying UI (root and visible title). Add feature-specific assertions when relevant, such as the current user's email on Profile. Initialize page objects in `test.beforeEach`; keep setup, actions and assertions separated by given/when/then in tests.

Headers describe UI controls; they do not log users in. Choose the relevant fixture under `fixtures/ui` to establish authentication. A new public page should extend `LoggedOutPage`; a new authenticated page should extend `LoggedInPage` and add only its own controls and destination checks.
