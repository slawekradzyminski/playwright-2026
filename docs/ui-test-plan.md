# Screen coverage and UI test plan

As of 2026-11-04: frontend `vite-react-frontend` 3.9.1 (routes from `src/AppRoutes.tsx`), backend 3.9.4.
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
| 4 | `/products` | Product list (categories, quantity, add to cart) | logged in | 1 | home, header |
| 5 | `/users` | User list (Edit/Delete for admin only) | logged in | 1 | home |
| 6 | `/profile` | Profile: personal info, system prompts, 2FA, orders | logged in | 1 | home, header |
| 7 | `/cart` | Cart (quantity, remove, clear, proceed to checkout) | logged in | 1 | header |
| 8 | `/email` | Send email | logged in | 1 | home, header |
| 9 | `/qr` | QR code generator | logged in | 1 | home, header |
| 10 | `/llm` | LLM hub (mode selection) | logged in | 1 | home, header |
| 11 | `/traffic` | Traffic Monitor (events, clearing) | logged in | 1 | home, header |
| 12 | `/admin` | Admin dashboard (stats, recent orders, low stock) | admin | 1 | header (also client redirect to `/`) |
| 13 | `/forgot-password` | Forgot password | anonymous | 0 | – |
| 14 | `/reset` | Set new password (token from email) | anonymous | 0 | – |
| 15 | `/auth/sso/callback` | SSO callback (Keycloak) | anonymous | 0 | – |
| 16 | `/products/:id` | Product details, add to cart | logged in | 0 | – |
| 17 | `/checkout` | Checkout: address, summary, place order | logged in | 0 | – |
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
| Screens opened by any test (level ≥ 1) | **12 / 30 = 40%** |
| Screens tested functionally (level 2) | **3 / 30 = 10%** |
| Screens without any test | 18 / 30 = 60% |

Notes:
- Authentication and navigation are tested well, but no business flow (shopping, admin) is covered.
- Access control is checked in two places: logging out blocks `/`, and a client opening `/admin` lands on `/`. The other admin routes and the anonymous redirect are not checked.

## Plan for the next stages

The order follows business risk. Every test follows `AGENTS.md`: given/when/then, page objects in `/pages`, `data-testid` selectors, independent tests that can run in parallel. Test data is set up through the API, not through the UI.

### Stage 1 – shopping flow (P1) → 6 screens to level 2

Needed: `ProductsApi`, `CartApi`, `OrdersApi` in `/api` and "user with a cart" / "user with an order" fixtures.

| Screen | Scenarios |
|---|---|
| `/products` → level 2 | filter by category; change quantity and add to cart from the list; open details |
| `/products/:id` | product details (name, price, availability); add N items → toast and cart counter |
| `/cart` → level 2 | empty cart; quantity change recalculates the total; remove an item; "Clear Cart"; "Proceed to Checkout" |
| `/checkout` | required address fields (5 messages); place order → `/orders/:id`, cart is empty |
| `/orders/:id` | items and address match the order; cancel a PENDING order |
| `/profile` (orders section) | order visible in "Your Orders", link to details |
| `/orders` | redirect to `/profile` |

### Stage 2 – admin panel (P1) → 9 screens to level 2

Needed: the admin fixture (exists) and per-test creation and cleanup of its own products and orders through the API.

| Screen | Scenarios |
|---|---|
| `/admin` → level 2 | sections and stats render; a low-stock product created by the test is visible in "Low Stock Products" |
| `/admin/products`, `/new`, `/edit/:id` | create a product (validation + success); edit; delete |
| `/admin/orders`, `/orders/:id` (admin) | client's order visible in the list; status change |
| `/admin/inventory`, `/:productId` | stock adjustment → new movement in history and updated stock |
| `/users`, `/users/:username/edit` | admin edits and deletes a user; client sees no Edit/Delete and gets "Access denied" |
| Access control | every `/admin/*` route: anonymous → `/login`, client → `/` (parameterised test) |

Parallelism constraint: the admin is a single shared account and the dashboard shows global counters. Assertions must target the test's own records, not totals.

### Stage 3 – account and security (P2) → 3 screens to level 2

| Screen | Scenarios |
|---|---|
| `/forgot-password` → `/reset` | request a reset → token from `GET /api/v1/local/email/outbox` → new password → login |
| `/reset` | missing or invalid token, password validation |
| `/profile` → level 2 | edit personal info; save system prompts; enable 2FA and log in with a code (`/signin/2fa`) |
| `/login` | "Forgot password?" link |

### Stage 4 – tools and LLM (P3) → 8 screens to level 2

| Screen | Scenarios |
|---|---|
| `/email` → level 2 | validation; send → message in the local outbox |
| `/qr` → level 2 | generate a QR image; "Clear" |
| `/traffic` → level 2 | action in the app → event in the list; "Clear Events" |
| `/llm` → level 2 | navigate to each of the three modes |
| `/llm/generate`, `/llm/chat`, `/llm/tools` | send a prompt → response from `ollama-mock`; settings |
| `/webmcp` | add to cart from the catalog, clear the cart |

### Out of scope / to be decided

- `/auth/sso/callback` and "Sign in with SSO": Keycloak runs locally (`:8082`), so this can be tested, but it needs a Keycloak account. A cheap first step is a test of the "Missing SSO authorization code" error.
- Google and GitHub login: external providers; in E2E we check at most that the button exists.

## Coverage forecast

| After stage | Level ≥ 1 | Level 2 |
|---|---|---|
| now | 12/30 (40%) | 3/30 (10%) |
| 1 | 16/30 (53%) | 9/30 (30%) |
| 2 | 23/30 (77%) | 18/30 (60%) |
| 3 | 25/30 (83%) | 21/30 (70%) |
| 4 | 29/30 (97%) | 29/30 (97%) |

`/auth/sso/callback` remains, pending the SSO decision.
