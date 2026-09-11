# UI page objects

Automated paths are **desktop-only, 1920 × 1080**, with the live local backend. Run `npm run test:ui`. The [test plan](../docs/ui-test-plan.md) tracks screen breadth and remaining scope; passing tests do not establish complete visual, accessibility or role coverage.

## Structure

- `BasePage` owns common route/root mechanics. Screen objects own locators, actions and outcome assertions, including supporting API persistence checks.
- `LoggedOutHeader`, `AuthenticatedHeader`, `ProductCard` and `Toast` are composed into their host screens. Component checks remain explicit in specs.
- `fixtures/ui/pages.ts` constructs test-scoped page objects. Specs show setup, action and outcome in given/when/then sections; navigation/setup remain visible at the call site.
- Prefer stable data-testid selectors. Inventory fields without test IDs use their labels. Directory rows use stable test-ID patterns scoped to the exact disposable username. Toasts use stable description children inside generated containers.
- Actions do not silently assert outcomes. URL, content, feedback and persistence checks have separate names. Use Playwright retrying assertions instead of fixed sleeps.
- Add/edit product share `AdminProductFormPage`, matching the shared frontend form, while their screen scenarios live in separate spec files.

## Data and sessions

`fixtures/ui/authenticated.ts` merges shared account fixtures with page objects. Each client context gets an API-created unique user and initial `token`, `refreshToken` and `clientSessionId` storage. No init script reinstalls credentials after logout. Shared cleanup tracks disposable users even after failures. Its `adminTest` logs in through the API, verifies ROLE_ADMIN and seeds an isolated context without modifying the shared admin account.

`fixtures/ui/registration.ts` tracks newly registered and duplicate-setup users. `fixtures/ui/products.ts` creates a unique three-product category and clears the client cart before deleting its products.

`fixtures/ui/commerce.ts` supplies disposable products, multi-item carts, unavailable/deleted products and API-created orders. Its admin variant uses the configured admin session while keeping each record owner disposable. Cleanup deletes the disposable owner and dependent carts/orders before their products; the shared tracker accepts already-deleted users. Successful UI product creations are recovered for cleanup by an exact unique category even if a test fails before reading the creation response. Cleanup never selects shared records by a broad name/prefix. UI creation is the action under test on registration, add-product and checkout screens; supporting setup uses the API.

## Current behavioral coverage

| Screen | Active tests | Main outcomes |
|---|---:|---|
| Login | 5 | Successful sign-in, invalid/required credentials, registration/recovery navigation |
| Registration | 4 | Account creation, required fields, duplicate username, sign-in navigation |
| Home | 8 | Exact client identity after reload and all seven shortcuts |
| Products | 5 | Category/search, both price sorts, empty recovery, detail navigation, cart mutations with aggregate count/toasts/API persistence |
| Product detail | 3 | Add/update/remove, zero stock, unavailable product recovery |
| Cart | 3 | Multi-product quantity/totals/removal, confirmed clearing, checkout navigation |
| Checkout | 4 | Order/address persistence, emptied cart and deducted stock; required address, empty-cart redirect, availability conflict preserving cart/address |
| Order detail | 1 | Own contents/address, client controls, cancellation dismissal/acceptance, persisted status and stock restoration |
| Profile & orders | 2 | Personal details and both prompts with feedback/reload; history filtering and matching order navigation |
| Users | 2 | Client directory without admin controls; persisted deletion of a disposable user |
| Edit user | 3 | Admin save, cancel valid unsaved changes, direct client denial |
| Admin dashboard | 2 | Low-stock product/editor link, client denial |
| Admin products | 2 | Row values, dismiss/confirm deletion, client denial |
| Add product | 2 | UI creation, reset and catalog/API values; client denial |
| Edit product | 2 | Details/price/stock persistence across reload; client denial |
| Admin orders | 2 | Status filtering, correct detail navigation/status update/re-filter; client denial |
| Admin inventory | 2 | Search/selection/stock adjustment/movement history; client denial for list and detail |

There are **52 screen tests + 16 shared-header tests = 68**. Shared-header coverage includes guest navigation, client destinations, exact identity, role-specific Admin link visibility, and logout with cleared storage and rejected protected-page revisit. Shared navigation runs once as the client; the admin checks its additional link. Email, QR, AI overview, traffic and forgot-password page objects remain navigation destinations only.

## Verification and exploration

Verified on **2026-09-11** at `http://localhost:8081`: `npm run test:ui` — **68 passed (9.8s)**; `npm run test:api` — **234 passed (22.8s)**; `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` passed. Frontend route source is pinned in the test plan; the deployed revision is unverified.

CLI exploration preceded the new screen automation. Product detail, cart, checkout, order detail, profile, directory/edit user, dashboard, catalog/create/edit product, orders and inventory were inspected at desktop 1920 × 1080, tablet 768 × 1024 and mobile 414 × 896, with screenshots opened for visual review. Successful mutations, required-field/no-mutation cases, cancellation, profile/prompt persistence, role denial, stock conflict and inventory rejection were checked against HTTP/UI/backend evidence. The cart's horizontal scrolling remains usable; admin list clipping is tracked as UI-12. Scratch evidence stays in ignored `exploration/ui/commerce-2026-09-11/`.

Known [UI findings](../docs/bugs/ui/README.md) remain open and are not asserted as correct behavior. Registration's valid-form sign-in side effect (UI-07), catalog keyboard detail access (UI-11), shared accessibility issues and admin responsive clipping (UI-12) need fixes/retests. No real-device, screen-reader, exhaustive pagination/status/ownership matrix, MFA enrollment or performance audit is claimed. The existing accepted mobile catalog layout remains unchanged.
