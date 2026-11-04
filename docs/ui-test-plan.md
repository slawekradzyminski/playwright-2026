# Screen coverage and UI test plan

As of 2026-11-04 (updated after automation for `/profile`, `/admin` and `/email`): frontend `vite-react-frontend` 3.9.1 (routes from `src/AppRoutes.tsx`), backend 3.9.4.
Every screen in the table was opened with `playwright-cli` as an anonymous user, a client and an admin. All of them render and none reports console errors.
Test data was set up through the API: registration, cart (`POST /api/v1/cart/items`) and order (`POST /api/v1/orders`).

## How coverage is measured

| Level | Meaning |
|---|---|
| **0 – none** | no test opens the screen |
| **1 – smoke** | a test only checks that the screen opens (URL + title), e.g. after a menu click |
| **2 – functional** | tests of the main flow and of validation/errors |

The unit is a route from `AppRoutes.tsx` (30 routes).

## Current state

| # | Route | Screen | Access | Level | Tests |
|---|---|---|---|---|---|
| 1 | `/login` | Login (+ Forgot password, SSO, Google, GitHub) | anonymous | **2** | `login.ui.spec.ts` |
| 2 | `/register` | Registration | anonymous | **2** | `register.ui.spec.ts` |
| 3 | `/` | Home page (greeting, sections, navigation tiles) | logged in | **2** | `home.ui.spec.ts`, `header.ui.spec.ts` |
| 4 | `/products` | Product list (categories, search, sort, stock filter, quantity, add/update/remove in cart) | logged in | **2** | `products.ui.spec.ts`, home, header |
| 5 | `/users` | User list (Edit/Delete for admin only) | logged in | 1 | home |
| 6 | `/profile` | Profile: personal info, system prompts, 2FA, orders | logged in | **2** | `profile.ui.spec.ts`, home, header |
| 7 | `/cart` | Cart (quantity, remove, clear, proceed to checkout) | logged in | **2** | `cart.ui.spec.ts`, header |
| 8 | `/email` | Send email | logged in | **2** | `email.ui.spec.ts`, home, header |
| 9 | `/qr` | QR code generator (generate, clear, validation) | logged in | **2** | `qr.ui.spec.ts`, home, header |
| 10 | `/llm` | LLM hub (mode selection) | logged in | 1 | home, header |
| 11 | `/traffic` | Traffic Monitor (events, clearing) | logged in | 1 | home, header |
| 12 | `/admin` | Admin dashboard (stats, recent orders, low stock) | admin | **2** | `admin.ui.spec.ts`, header (client redirect to `/`) |
| 13 | `/forgot-password` | Forgot password | anonymous | 0 | – |
| 14 | `/reset` | Set new password (token from email) | anonymous | 0 | – |
| 15 | `/auth/sso/callback` | SSO callback (Keycloak) | anonymous | 0 | – |
| 16 | `/products/:id` | Product details (add, update, remove in cart; out of stock; not found) | logged in | **2** | `product-details.ui.spec.ts`, `products.ui.spec.ts` (opened from the list) |
| 17 | `/checkout` | Checkout: address, summary, place order | logged in | 1 | `cart.ui.spec.ts` ("Proceed to Checkout") |
| 18 | `/orders` | Redirect to `/profile` | logged in | 0 | – |
| 19 | `/orders/:id` | Order details: cancel; admin changes status | logged in | 0 | – |
| 20 | `/users/:username/edit` | Edit user (client sees "Access denied") | admin | 0 | – |
| 21 | `/llm/chat` | LLM chat | logged in | 0 | – |
| 22 | `/llm/generate` | Single prompt generation | logged in | 0 | – |
| 23 | `/llm/tools` | Tool-calling chat (product catalog) | logged in | 0 | – |
| 24 | `/webmcp` | WebMCP shop lab (catalog, cart, agent tools) | logged in | 0 | – |
| 25 | `/admin/products` | Manage products (list, delete) | admin | 0 | – |
| 26 | `/admin/products/new` | Add product | admin | 0 | – |
| 27 | `/admin/products/edit/:id` | Edit product | admin | 0 | – |
| 28 | `/admin/orders` | Manage orders (pagination) | admin | 0 | – |
| 29 | `/admin/inventory` | Inventory: list | admin | 0 | – |
| 30 | `/admin/inventory/:productId` | Inventory: movements and stock adjustment | admin | 0 | – |

### Summary

| Metric | Result |
|---|---|
| Screens opened by any test (level ≥ 1) | **14 / 30 = 47%** |
| Screens tested functionally (level 2) | **10 / 30 = 33%** |
| Screens without any test | 16 / 30 = 53% |

Notes:
- Authentication and navigation are tested well. The shopping flow is covered up to the cart (list, details, cart); checkout and orders still need functional coverage. The admin dashboard has functional coverage.
- Product tests create their own products (unique category per test) through the admin API and delete them afterwards, so they do not depend on the shared catalog.
- Logging out blocks `/`. Opening `/admin` as a client redirects to `/`, and as an anonymous visitor redirects to `/login`. Child admin routes still need access checks.

## Plan for the next stages

The order follows business risk. Every test follows the `ui-testing` skill (`.claude/skills/ui-testing`): given/when/then, page objects in `/pages`, `data-testid` selectors, independent tests that can run in parallel. Test data is set up through the API, not through the UI.

### Stage 1 – shopping flow (P1) → 6 screens to level 2

Done: `ProductsApi`, `CartApi`, `productGenerator` and the `products.fixture` (`createProduct`, `cartApi`). Still needed: `OrdersApi` and a "user with an order" fixture.

| Screen | Scenarios |
|---|---|
| ~~`/products` → level 2~~ | **done 2026-11-04**: category filter, card content, search + empty state/reset, sort by price, "In stock only", add N to cart, update and remove an item already in the cart, quantity capped by stock, open details |
| ~~`/products/:id` → level 2~~ | **done 2026-11-04**: name, price, description, category, stock; add N → toast, cart counter, "N in cart"; update and remove an item already in the cart; quantity capped by stock; out of stock (Add disabled, no quantity controls); stock lowered after page load → error toast; deleted product → error box and link back; back link; anonymous → `/login`. Not automated: non-numeric id (BUG-006). Frontend request: `toast-title` test id on the "Failed to update cart" error toast |
| ~~`/cart` → level 2~~ | **done 2026-11-04**: empty cart; items, line totals and summary; quantity change + "Update" recalculates totals (UI and API); "-" stops at 1; not automated: quantity above stock (BUG-007); remove an item; "Clear Cart" confirmed and cancelled; "Proceed to Checkout" → `/checkout` |
| `/checkout` | required address fields (5 messages); place order → `/orders/:id`, cart is empty |
| `/orders/:id` | items and address match the order; cancel a PENDING order |
| `/profile` (orders section) | order visible in "Your Orders", link to details |
| `/orders` | redirect to `/profile` |

### Stage 2 – admin panel (P1) → 9 screens to level 2

Done: shared admin login and isolated product creation and cleanup for dashboard tests. Still needed: isolated order setup and cleanup.

| Screen | Scenarios |
|---|---|
| ~~`/admin` → level 2~~ | **done 2026-11-04**: metric, recent-order and low-stock sections render; API-created low-stock product appears; anonymous and client redirects. Error and pagination regressions tracked in BUG-011 and BUG-013 |
| `/admin/products`, `/new`, `/edit/:id` | create a product (validation + success); edit; delete |
| `/admin/orders`, `/orders/:id` (admin) | client's order visible in the list; status change |
| `/admin/inventory`, `/:productId` | stock adjustment → new movement in history and updated stock |
| `/users`, `/users/:username/edit` | admin edits and deletes a user; client sees no Edit/Delete and gets "Access denied" |
| Access control | each child `/admin/*` route: anonymous → `/login`, client → `/` (parameterised test) |

Parallelism constraint: the admin is a single shared account and the dashboard shows global counters. Assertions must target the test's own records, not totals.

### Stage 3 – account and security (P2) → 3 screens to level 2

| Screen | Scenarios |
|---|---|
| `/forgot-password` → `/reset` | request a reset → token from `GET /api/v1/local/email/outbox` → new password → login |
| `/reset` | missing or invalid token, password validation |
| ~~`/profile` → level 2~~ | **done 2026-11-04**: edit personal info and reject an invalid email; persist both prompts; enable 2FA and sign in with TOTP. Order history remains in Stage 1 |
| `/login` | "Forgot password?" link |

### Stage 4 – tools and LLM (P3) → 8 screens to level 2

| Screen | Scenarios |
|---|---|
| ~~`/email` → level 2~~ | **done 2026-11-04**: form validation; real submission and per-user backend event. Final delivery to the local outbox was verified during exploration; backend scheduling takes 10 seconds to 10 minutes |
| ~~`/qr` → level 2~~ | **done 2026-11-04**: empty form state, generate (request body + displayed PNG equals `POST /api/v1/qr/create` for the same text), replace with new text, "Clear", empty/whitespace-only error, diacritics/emoji, HTML, multi-line, spaces, max length 2953, too long → error; not automated: stale image after error (BUG-010). Helpers: `QrApi`, `qr.fixture` (`qrApi`). Frontend request: `qr-code-container` test id is used twice once a code is shown |
| `/traffic` → level 2 | action in the app → event in the list; "Clear Events" |
| `/llm` → level 2 | navigate to each of the three modes |
| `/llm/generate`, `/llm/chat`, `/llm/tools` | send a prompt → response from `ollama-mock`; settings |
| `/webmcp` | add to cart from the catalog, clear the cart |

### Exploratory sessions

| Date | Screens | Findings |
|---|---|---|
| 2026-11-04 | `/products` (client; desktop, tablet, mobile) | no functional or visual bugs; 5 a11y findings added to BUG-004 (details not reachable by keyboard, unnamed "-"/"+" buttons, unlabelled search, category state, page title); 5 usability findings added to BUG-005 (out-of-stock card, quantity 0, filters lost on refresh, price formatting, diacritics in search) |
| 2026-11-04 | `/products/:id` (client, anonymous; desktop, tablet, mobile) | BUG-006 (non-numeric id → `/api/v1/products/NaN`, 4 requests, 7 s loading); no visual bugs (long name with diacritics, HTML in name/description rendered as text, price 99999999.99); 3 a11y findings added to BUG-004 ("-"/"+" names and unannounced quantity, error state not announced, page title); 5 usability findings added to BUG-005 (quantity 0 / "Update" removes, generic stock-conflict error with stale stock, "Error loading" for a missing product, Back resets the category, deep link lost after login) |
| 2026-11-04 | `/cart` (client, anonymous redirect to `/login`; desktop, tablet, mobile) | BUG-007 (quantity above stock, 409 not shown); 2 a11y findings added to BUG-004 (row controls without product context, page title); 3 usability findings added to BUG-005 (pending quantity lost on checkout, no toasts, quantity/Remove off-screen on mobile and tablet) |
| 2026-11-04 | `/qr` (client; desktop, tablet, mobile) | BUG-008 diacritics/emoji become "?" in the code (backend charset), BUG-009 text > 2953 chars → 500 and generic error, BUG-010 previous code stays after a failed generation; 5 a11y findings added to BUG-004 (Generate focus indicator, focus lost after Generate/Clear, result not announced/generic alt, placeholder contrast, page title); 3 usability findings added to BUG-005 (no success feedback with stale error toast, result below the fold on mobile, no download/copy) |
| 2026-11-04 | `/profile` (client: desktop, tablet, mobile; admin: desktop; anonymous: mobile) | contact details and both prompts persisted after reload; invalid email rejected; 2FA setup, cancellation, enrollment, and TOTP sign-in checked; BUG-004: email error association and generic title |
| 2026-11-04 | `/admin` (admin, client, anonymous: desktop, tablet, mobile) | anonymous redirected to `/login`, client to `/`; API-created item with stock 3 appeared in Low Stock Products; BUG-011: metrics use only the first page; BUG-013: 500 responses show zero metrics and empty states; BUG-004: generic title |
| 2026-11-04 | `/email` (client: desktop, tablet, mobile; admin and anonymous: desktop) | anonymous redirected to `/login`; required fields, malformed address, and excessive lengths rejected; mocked 500 shows an error and retains inputs; synthetic message appeared in the local outbox; BUG-012: duplicate submit while pending; BUG-004: generic title and unassociated validation errors; BUG-005: queued message described as sent, whitespace-only fields rejected without inline errors |

Regression candidates once fixed: keyboard access to product details, out-of-stock label, "-" disabled at 1, filters kept in the URL; `/products/:id`: non-numeric id shows the error at once without `NaN` requests (BUG-006), stock conflict toast names the reason, deep link kept after login.
`/cart`: "+" capped by stock / 409 shown (BUG-007), toasts after cart actions, pending quantity saved before checkout.
`/qr`: content of the decoded code for UTF-8 text (API level, needs a QR decoder; BUG-008), 400 with a length message (BUG-009), previous code hidden after a failed generation (BUG-010).

`/profile`: invalid email exposes an accessible error association (BUG-004).
`/admin`: metrics cover more than 50 orders (BUG-011); failing catalog or orders requests show an error state and preserve healthy sections (BUG-013).
`/email`: a second submit while the first request is pending sends no duplicate POST (BUG-012); queued confirmation and inline validation for whitespace-only subject and message (BUG-005).

### Out of scope / to be decided

- `/auth/sso/callback` and "Sign in with SSO": Keycloak runs locally (`:8082`), so this can be tested, but it needs a Keycloak account. A cheap first step is a test of the "Missing SSO authorization code" error.
- Google and GitHub login: external providers; in E2E we check at most that the button exists.

## Coverage forecast

| After stage | Level ≥ 1 | Level 2 |
|---|---|---|
| now | 14/30 (47%) | 10/30 (33%) |
| 1 | 16/30 (53%) | 13/30 (43%) |
| 2 | 23/30 (77%) | 21/30 (70%) |
| 3 | 25/30 (83%) | 23/30 (77%) |
| 4 | 29/30 (97%) | 29/30 (97%) |

`/auth/sso/callback` remains, pending the SSO decision.
