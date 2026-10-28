# UI test plan

Screen = a routed view declared in frontend `src/AppRoutes.tsx`. Count each route pattern once, including parameterized detail routes and distinct create/edit modes. `/orders` redirects to `/profile` and is tracked as a navigation scenario, not another screen. Shared headers, dialogs, tabs, MFA states and transport modes are scenarios within screens, not additional screens.

A screen is covered only when an active, explicit Playwright UI test exercises and asserts functionality of that screen itself. Homepage shortcut and header navigation checks cover the source navigation only; they do not cover the destination screen, even when they assert its title, list, identity fields or empty state. URL-only assertions, setup, cleanup, exploratory CLI checks, skipped tests and frontend unit tests do not count. This measures screens with direct functional tests, not complete workflows, role coverage, accessibility conformance or passing results.

**4 / 29 covered (13.8%); 25 remaining (86.2%).**

| Area | Covered / total | Remaining |
| --- | ---: | ---: |
| Public authentication | 2 / 5 | 3 |
| Homepage | 1 / 1 | 0 |
| Account and users | 0 / 3 | 3 |
| Customer commerce | 1 / 5 | 4 |
| AI workspace | 0 / 4 | 4 |
| Supporting tools | 0 / 3 | 3 |
| WebMCP shop lab | 0 / 1 | 1 |
| Admin commerce and inventory | 0 / 7 | 7 |

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
| `/profile` | Client or admin, own account | Gap: navigation only | Save and persistence, system prompts, MFA lifecycle, own orders/filtering/pagination, error recovery |
| `/products` | Client or admin | Covered | Anonymous/admin access, description/category search, name sorting, catalog loading/empty/error recovery, cart-read failure, stock conflicts, pending writes/transport switching, product-detail keyboard access and remaining accessibility |
| `/products/:id` | Client or admin | Gap | Detail data, quantity/stock limits, add/update/remove cart item, unavailable/invalid product |
| `/cart` | Client or admin, own cart | Gap: navigation only | Populated cart, quantities/totals, update/remove/clear, stock conflicts, persistence and isolation |
| `/checkout` | Client or admin, nonempty own cart | Gap | Empty-cart redirect, shipping validation, totals, single order submission, stock/error recovery |
| `/orders/:id` | Owner; admin for management | Gap | Own detail/address/items, cancellation, allowed admin status changes, forbidden foreign order, invalid ID |
| `/llm` | Client or admin | Gap: navigation only | Open all three modes and return navigation |
| `/llm/chat` | Client or admin | Gap | Model/settings, persisted prompt, conversation and stream completion/error/stop behavior |
| `/llm/generate` | Client or admin | Gap | Prompt validation, settings, streamed result, loading/error/retry |
| `/llm/tools` | Client or admin | Gap | Tool definitions, grounded response/tool results, stream/error paths and user isolation |
| `/email` | Client or admin | Gap: navigation only | Recipient selection, validation, queued-success feedback, delivery failure; use disposable recipients |
| `/qr` | Client or admin | Gap: navigation only | Text/URL generation, returned image content, clear, validation and backend error |
| `/traffic` | Client or admin | Gap: navigation only | Connected state, live session-scoped events, event details, clear and reconnect |
| `/webmcp` | Client or admin | Gap | Search/stock filter, quantities, add-to-cart/totals; tools available/unavailable/off and explicit fault modes |
| `/admin` | Admin | Gap: navigation only | Summary data, recent orders, low stock and section shortcuts, loading/error states |
| `/admin/products` | Admin | Gap | List, new/edit navigation, delete confirmation/cancel, refresh and error states |
| `/admin/products/new` | Admin | Gap | Field validation, create, feedback and catalog persistence |
| `/admin/products/edit/:id` | Admin | Gap | Prefill/update, field validation, persistence, missing/invalid product |
| `/admin/orders` | Admin | Gap | All-customer list, status filter, pagination, details, empty/error states |
| `/admin/inventory` | Admin | Gap | Search/category/stock filters, threshold, pagination, selection and empty/error states |
| `/admin/inventory/:productId` | Admin | Gap | Deep-linked selection, signed adjustment/reason validation, resulting stock/movements, invalid IDs |

Counted screen coverage comes from `tests/ui/auth/login.ui.spec.ts`, `tests/ui/auth/registration.ui.spec.ts`, the homepage identity/persistence-after-reload scenario in `tests/ui/home/home.ui.spec.ts`, and the direct catalog scenarios in `tests/ui/products/products.ui.spec.ts`. The catalog suite exercises category/search/stock filtering, no-results recovery, numeric price sorting, card data, quantity boundaries and cart add/update/removal/persistence with mutation failure recovery on `/products`. These catalog cart actions do not cover the separate `/cart` screen. Homepage shortcuts and `tests/ui/navigation/logged-in-header.ui.spec.ts` / `tests/ui/mobile/logged-in-header.ui.spec.ts` cover navigation, client identity, logout and admin-link visibility; destination screens remain uncovered until they have direct functional tests. These shared checks do not establish full route or API authorization. Separate axe scans in `tests/accessibility/` are supplementary and do not add screens to the numerator.

Remaining priorities:

1. **Authorization and sessions:** for every protected route verify anonymous redirect to `/login`; for all seven `/admin` routes verify client redirect to `/` and authorized admin content. Check the separate user-editor denial, admin-only user actions, foreign cart/order isolation, refresh/expiry and logout. Verify backend enforcement as well as hidden links; use the API skill for API exploration or defects.
2. **Customer purchase journey (4 uncovered screens):** product details → populated cart → checkout → order details/profile, with quantity/totals, stock boundaries, duplicate-submit protection and cancellation. Include the `/orders` → `/profile` alias. Add direct cart tests; existing cart navigation checks do not count as screen coverage. Deepen the covered catalog with role checks, catalog loading/error recovery, stock conflicts, transport parity and accessibility.
3. **Admin operations (7 uncovered screens) and user editor (1):** dashboard summaries/shortcuts, product create/edit/delete, order filtering/details/status, inventory filtering/adjustments/movement history, and user list/edit/delete. Use owned disposable entities. The configured shared admin is a read-only UI fixture; mutation scenarios need an explicit suitable admin fixture/data lifecycle, without changing the shared admin account or its sessions.
4. **Account recovery and security (3 uncovered public screens):** password recovery/reset and SSO callback, then direct profile identity/save, prompts, orders and MFA/login challenges. All three account/user screens remain uncovered. Keep success and failure branches explicit; external identity and email delivery need their real dependencies.
5. **Integrations (4 AI screens, 3 supporting tools and 1 lab screen):** AI overview/mode selection, generation/chat/tool streaming, WebMCP, email, QR and traffic behavior. All require direct functional tests beyond existing navigation checks. For commerce, exercise the shared Shop API REST/GraphQL selector with representative equivalent outcomes, switching/reload, error mapping and pending-mutation behavior; transport modes do not multiply screen counts.

For each group, inspect frontend routes/components, role checks, state/validation and HTTP integration, explore the real UI with Playwright CLI, triage findings, then add representative independent tests when requested. Include meaningful success, validation, loading/error/retry, keyboard and role scenarios according to risk. Use the UI skill's phone, tablet (both orientations) and desktop exploration targets, and functional, accessibility, usability and visual review aspects. Existing desktop automation and selected mobile header tests do not imply responsive coverage of every screen.

Inventory basis: [frontend reference](https://github.com/slawekradzyminski/vite-react-frontend) commit `7392a3a935b373f3160c5a3ae4162c5b2f310624`, `src/AppRoutes.tsx`, `ProtectedRoute`, page-level role checks and the explicit test subjects above: 30 route patterns, 29 screens and one redirect alias. Reconcile source changes and the running application's available routes before extending coverage. Keep runtime checks, build-match uncertainty, findings and task-specific evidence outside this current coverage inventory.
