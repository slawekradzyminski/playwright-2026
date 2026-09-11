# Test fixtures

Fixtures are lazy and test-scoped. Import the smallest entry point that supplies the test's setup; there is no global fixture barrel or worker-shared mutable account.

| Directory | Responsibility | Entry points |
|---|---|---|
| `shared/` | API-backed authentication and account lifecycle used by both test layers | `admin`, `signup`, `account` |
| `api/` | Product, inventory and commerce setup for API scenarios | `product`, `inventory`, `commerce` |
| `ui/` | Page objects, browser authentication and registration scenarios | `pages`, `authenticated`, `registration` |

## Shared setup

- `shared/admin.ts`: `adminSession` signs in the configured admin once per requesting test; `adminToken` exposes its access token. It never creates or deletes the shared admin.
- `shared/signup.ts`: `signup(user)` tracks only successful API registrations. `trackUser(username)` also lets UI registration register a unique cleanup target before creation. Cleanup accepts 204 or 404, since a test can delete the account itself or leave registration incomplete. Never track an existing shared account.
- `shared/account.ts`: `account` supplies one disposable signed-in client; `createAccount(overrides)` supplies additional clients. Both use the same signup, session validation and cleanup. The returned shape is `{ user, token, refreshToken }`.
- `shared/session.ts` is a helper, not a fixture entry point. It validates login status, role, MFA state and both tokens consistently.

The dependency chain is `account → createAccount → signup → trackUser → adminToken → adminSession`. Tracking happens before client login, so a login or test failure still runs account cleanup. Tests that need only an admin or signup do not create a client session.

## API setup

`product` composes shared account fixtures and supplies product tracking; `inventory` adds a deterministic inventory product. `commerce` creates two clients and a product, and optionally an order. It shares login validation but owns its resource lifetime explicitly: user deletion removes dependent orders before product deletion. Keep that cleanup order when extending it.

## UI setup

- `ui/pages.ts` constructs page objects without authenticating.
- `ui/authenticated.ts` exports `test` for a disposable client and `adminTest` for the configured administrator. Each composes page objects with the appropriate shared fixture. Admin tests do not inherit client creation. Both use the same initial storage-state builder with a unique browser session ID; no init script restores tokens after logout.
- `ui/registration.ts` supplies a unique `registrationUser` and API-created `existingRegistrationUser`. Both use the shared cleanup tracker, including when UI registration fails.

Browser actions and assertions belong to page objects. Endpoint clients belong to `clients/`; fixtures own only setup, composition and teardown. Add fixtures to `shared/` when both test layers need them, rather than making UI fixtures depend on the API scenario layer.

Verify changes with `npm run test:api`, `npm run test:ui`, and `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`.
