# Authenticated UI tests

Import `test` and `expect` from `loggedInUi.fixture.ts`. The normal `page` fixture is authenticated before its first navigation. Instantiate the page object under test in `test.beforeEach`, then navigate in the test's given/when flow.

`loggedInUser` exposes `{ user, token, refreshToken }`, matching the API helper. Each test gets a separate API-created account and fresh browser context; cleanup deletes the account through the existing admin client in `finally`.

The fixture seeds `token` and `refreshToken` in localStorage for the configured baseURL origin using in-memory `storageState`. The frontend obtains the profile from `/api/v1/users/me` and manages `clientSessionId`. No auth cookie, profile object, persistent auth file or repeated init script is required. Logout therefore stays logged out across reloads.

See [homepage tests](../../tests/ui/home.ui.spec.ts) for navigation, identity, reload and logout examples. Login/registration tests keep their unauthenticated fixtures. This fixture covers ordinary client accounts; it does not establish expired-token refresh or admin-session coverage.

## Admin sessions

Import `test` and `expect` from `loggedInAdminUi.fixture.ts` for admin UI tests. It signs in using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from the existing configuration, validates `ROLE_ADMIN`, and seeds the same origin-scoped storage through `authStorageState`. `loggedInAdmin` exposes the login response: identity fields, roles, token and refreshToken.

Each test uses a fresh login and browser context. The configured admin account is shared: this fixture does not create/delete the account or log it out. Keep tests read-only unless their mutations have explicitly isolated setup and cleanup. See [admin navigation tests](../../tests/ui/navigation/adminNavigation.ui.spec.ts). Client tests continue to use disposable accounts from `loggedInUi.fixture.ts`.

## Shared resource ownership

Authenticated UI fixtures extend the shared [resource base](../README.md). Product catalogs, admin products and inventory reuse `productFactory`; customer cleanup belongs to `accountFactory`. Order authentication selects a lazy identity and does not instantiate order products. Request `orderSetup` only for scenarios requiring its users/products.
