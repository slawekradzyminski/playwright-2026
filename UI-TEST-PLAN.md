# UI test plan

Screen = a routed view declared in frontend `src/AppRoutes.tsx`. Count each route pattern once, including parameterized detail routes and distinct create/edit modes. `/orders` redirects to `/profile` and is tracked as a navigation scenario, not another screen. Shared headers, dialogs, tabs, MFA states and transport modes are scenarios within screens, not additional screens.

A screen is covered only when an active, explicit Playwright UI test exercises and asserts functionality of that screen itself. Homepage shortcut and header navigation checks cover the source navigation only; they do not cover the destination screen, even when they assert its title, list, identity fields or empty state. URL-only assertions, setup, cleanup, exploratory CLI checks, skipped tests and frontend unit tests do not count. This measures screens with direct functional tests, not complete workflows, role coverage, accessibility conformance or passing results.

**15 / 29 covered (51.7%); 14 remaining (48.3%).**

| Area | Covered / total | Remaining |
| --- | ---: | ---: |
| Public authentication | 2 / 5 | 3 |
| Homepage | 1 / 1 | 0 |
| Account and users | 1 / 3 | 2 |
| Customer commerce | 5 / 5 | 0 |
| AI workspace | 0 / 4 | 4 |
| Supporting tools | 0 / 3 | 3 |
| WebMCP shop lab | 0 / 1 | 1 |
| Admin commerce and inventory | 6 / 7 | 1 |

All routes below are frontend paths relative to the configured gateway. **Covered** requires direct functional tests of the screen; the final column identifies work still needed. Navigation-only destinations remain gaps.

| Screen / route pattern | Intended access | Explicit UI coverage | Remaining scenarios |
| --- | --- | --- | --- |
| `/login` | Public | Covered | MFA challenge/recovery code, SSO initiation, session expiry/refresh, validation accessibility |
| `/register` | Public | Covered | Login navigation without accidental submission, error associations, remaining boundaries |
| `/forgot-password` | Public | Gap | Username/email request, neutral response, validation, delivery dependency and recovery |
| `/reset` | Public | Gap | Query token prefill, confirmation, valid/invalid/expired/used token, subsequent login |
| `/auth/sso/callback` | Public callback | Gap | Valid callback, missing code/state, exchange failure, safe return destination |
| `/` | Client or admin | Covered | Loading/error states and role-specific content beyond existing shortcuts and identity/reload |
| `/users` | Client or admin; admin actions only | Gap: navigation only | Admin edit/delete controls, client absence, owned-user deletion, loading/error/empty states |
| `/users/:username/edit` | Admin editor; client sees Access denied | Gap | Prefill, validation, save/cancel, missing user, denial; role handling is inside the page |
| `/profile` | Client or admin, own account | Covered (order history) | Save and persistence, system prompts, MFA lifecycle, order filtering/pagination, REST-mode history |
| `/products` | Client or admin | Covered | Anonymous/admin access, description/category search, name sorting, catalog loading/empty/error recovery, cart-read failure, stock conflicts, pending writes/transport switching, product-detail keyboard access and remaining accessibility |
| `/products/:id` | Client or admin | Covered | Admin access, cart-read failure, stock changes/conflicts, pending writes, transport parity, invalid IDs and remaining keyboard/accessibility |
| `/cart` | Client or admin, own cart | Covered | Admin access, foreign-cart isolation, loading/read errors, mutation-failure recovery, stock conflicts, transport parity and remaining accessibility |
| `/checkout` | Client or admin, nonempty own cart | Covered | Empty-cart redirect, field validation messages, non-conflict failure alert, REST-mode checkout, uncertain/lost responses |
| `/orders/:id` | Owner; admin for management | Covered | Foreign order and invalid ID, cancel dismissal/failure, unit-price formatting after [BUG-0028](bugs/ui/BUG-0028-order-unit-price-not-formatted.md) |
| `/llm` | Client or admin | Gap: navigation only | Open all three modes and return navigation |
| `/llm/chat` | Client or admin | Gap | Model/settings, persisted prompt, conversation and stream completion/error/stop behavior |
| `/llm/generate` | Client or admin | Gap | Prompt validation, settings, streamed result, loading/error/retry |
| `/llm/tools` | Client or admin | Gap | Tool definitions, grounded response/tool results, stream/error paths and user isolation |
| `/email` | Client or admin | Gap: navigation only | Recipient selection, validation, queued-success feedback, delivery failure; use disposable recipients |
| `/qr` | Client or admin | Gap: navigation only | Text/URL generation, returned image content, clear, validation and backend error |
| `/traffic` | Client or admin | Gap: navigation only | Connected state, live session-scoped events, event details, clear and reconnect |
| `/webmcp` | Client or admin | Gap | Search/stock filter, quantities, add-to-cart/totals; tools available/unavailable/off and explicit fault modes |
| `/admin` | Admin | Gap: navigation only | Summary data, recent orders, low stock and section shortcuts, loading/error states |
| `/admin/products` | Admin | Covered | Delete cancellation, referenced-product delete ([UI-Q7](bugs/ui/QUESTIONS.md)), loading/error states, client denial |
| `/admin/products/new` | Admin | Covered | Field validation, save feedback after [BUG-0027](bugs/ui/BUG-0027-admin-product-form-gives-no-feedback.md), rejected save |
| `/admin/products/edit/:id` | Admin | Covered | Field validation, missing/invalid product, save feedback (BUG-0027) |
| `/admin/orders` | Admin | Covered | Empty/error states, client denial, REST mode |
| `/admin/inventory` | Admin | Covered | Category/status filters, threshold, pagination, keyboard selection after [BUG-0029](bugs/ui/BUG-0029-inventory-rows-unreachable-by-keyboard.md), empty/error states |
| `/admin/inventory/:productId` | Admin | Covered | Delta/reason validation, invalid IDs, same-request retry after uncertain responses |

Counted screen coverage comes from `tests/ui/auth/login.ui.spec.ts`, `tests/ui/auth/registration.ui.spec.ts`, the homepage identity/persistence-after-reload scenario in `tests/ui/home/home.ui.spec.ts`, and the direct catalog scenarios in `tests/ui/products/products.ui.spec.ts`. The catalog suite exercises category/search/stock filtering, no-results recovery, numeric price sorting, card data, quantity boundaries and cart add/update/removal/persistence with mutation failure recovery on `/products`. Direct product-detail coverage in `tests/ui/products/product-details.ui.spec.ts` exercises detail data, quantity/stock limits, add/reload/update/removal, failed-update recovery and missing-product navigation. `tests/ui/products/product-details-anonymous.ui.spec.ts` verifies anonymous redirection. Direct cart coverage in `tests/ui/cart/cart.ui.spec.ts` exercises empty and populated states, quantities/totals, reload persistence, keyboard activation of the quantity minimum, removal and multi-item clear confirmation/cancellation. `tests/ui/cart/cart.access.ui.spec.ts` verifies anonymous cart redirection. These suites establish functional coverage of the two separate screens; catalog cart actions alone do not. Homepage shortcuts and `tests/ui/navigation/logged-in-header.ui.spec.ts` / `tests/ui/mobile/logged-in-header.ui.spec.ts` cover navigation, client identity, logout and admin-link visibility; destination screens remain uncovered until they have direct functional tests. These shared checks do not establish full route or API authorization. Separate axe scans in `tests/accessibility/` are supplementary and do not add screens to the numerator. `tests/ui/graphql/purchase.ui.spec.ts` and `admin.ui.spec.ts` directly cover checkout, order details, profile order history and six admin product/order/inventory screens.

Remaining priorities:

1. **Authorization and sessions:** for the remaining protected routes verify anonymous redirect to `/login`; for all seven `/admin` routes verify client redirect to `/` and authorized admin content. Check the separate user-editor denial, admin-only user actions, foreign cart/order isolation, refresh/expiry and logout. Verify backend enforcement as well as hidden links; use the API skill for API exploration or defects.
2. **Customer purchase journey depth (all five commerce screens covered):** REST-mode checkout/order details, shipping validation messages, the `/orders` → `/profile` alias, foreign-order isolation, loading and mutation-error recovery, stock conflicts on catalog/detail/cart and remaining accessibility. Profile save/prompts/MFA remain separate account work.
3. **Admin operations (dashboard and user editor uncovered):** dashboard summaries/shortcuts and user list/edit/delete; deepen covered admin commerce screens with validation, empty/error states, client denial on all `/admin` routes and the defects BUG-0027/BUG-0029. Mutations use `adminCommerceTest` on test-owned entities only, never the shared administrator account itself.
4. **Account recovery and security (3 uncovered public screens):** password recovery/reset and SSO callback, then direct profile identity/save, prompts and MFA/login challenges. `/users` and `/users/:username/edit` remain uncovered; `/profile` is covered only by order history. Keep success and failure branches explicit; external identity and email delivery need their real dependencies.
5. **Integrations (4 AI screens, 3 supporting tools and 1 lab screen):** AI overview/mode selection, generation/chat/tool streaming, WebMCP, email, QR and traffic behavior. All require direct functional tests beyond existing navigation checks. For commerce, exercise the shared Shop API REST/GraphQL selector with representative equivalent outcomes, switching/reload, error mapping and pending-mutation behavior; transport modes do not multiply screen counts.

For each group, inspect frontend routes/components, role checks, state/validation and HTTP integration, explore the real UI with Playwright CLI, triage findings, then add representative independent tests when requested. Include meaningful success, validation, loading/error/retry, keyboard and role scenarios according to risk. Use the UI skill's phone, tablet (both orientations) and desktop exploration targets, and functional, accessibility, usability and visual review aspects. Existing desktop automation and selected mobile header tests do not imply responsive coverage of every screen.

Inventory basis: [frontend reference](https://github.com/slawekradzyminski/vite-react-frontend) commit `7392a3a935b373f3160c5a3ae4162c5b2f310624`, `src/AppRoutes.tsx`, `ProtectedRoute`, page-level role checks and the explicit test subjects above: 30 route patterns, 29 screens and one redirect alias. Reconcile source changes and the running application's available routes before extending coverage. Keep runtime checks, build-match uncertainty, findings and task-specific evidence outside this current coverage inventory.

## GraphQL scenarios

Done. Shop API modes are scenarios, not screens. `tests/ui/graphql/` covers the selector (default, switching, reload, per-context choice, keyboard), storefront, purchase and admin journeys, operation-specific failures, token refresh, lost checkout responses and pending-write guards; `tests/ui/mobile/commerce-transport.ui.spec.ts` covers phone and tablet. Open defects BUG-0022, BUG-0023 and BUG-0025 get their regressions with the frontend fixes.
