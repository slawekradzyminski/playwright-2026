# UI test plan

**Last verified: 2026-09-11.** [UI Testing skill](../.codex/skills/ui-testing/SKILL.md) · [Frontend routes](https://github.com/slawekradzyminski/vite-react-frontend/blob/41e177a6e4b4f53ffb75d0e37b0666dcb9508277/src/AppRoutes.tsx) · [Tests](../tests/ui) · [Bug register](bugs/ui/README.md)

## Coverage and last execution

**17/27 screens (63.0%); 10 remaining.** Count a screen when a dedicated active screen spec asserts its behavior beyond opening its URL/root. This measures screen breadth, not complete workflows, roles, accessibility or visual coverage. **Covered** = behavioral tests; **Navigation** = destination checks only; **Planned** = no current UI assertions. Headers are shared components, excluded from the denominator.

Last run: `npm run test:ui` — **68 passed, 0 failed, 0 skipped (9.8s)** at `http://localhost:8081`, Chromium, desktop **1920 × 1080**. Source inventory: frontend revision `41e177a`; deployed revision unverified. CLI exploration covered the requested commerce/profile/admin screens at desktop, tablet and mobile sizes, with reviewed HTTP and persisted state. API suite: **234 passed (22.8s)**; TypeScript unused-symbol checks passed.

| Screen / route | Access | Coverage | Automated now / next behavior |
|---|---|---|---|
| Login `/login` | Guest | Covered | 5 tests: sign-in, required/invalid credentials, registration/recovery links |
| Registration `/register` | Guest | Covered | 4 tests: creation, required fields, duplicate username, sign-in link |
| Forgot password `/forgot-password` | Guest | Navigation | Request recovery for a disposable account |
| Reset password `/reset` | Guest + reset token | Planned | Reset and sign in; invalid/expired token |
| SSO callback `/auth/sso/callback` | SSO flow | Planned | Complete exchange; reject invalid callback |
| Home `/` | Signed in | Covered | 8 tests: identity after reload and seven shortcuts |
| Products `/products` | Signed in | Covered | 5 tests: category/search, price sorting, empty-result recovery, detail navigation, persisted cart add/update/remove with aggregate counter and toast feedback; UI-11 open |
| Product detail `/products/:id` | Signed in | Covered | 3 tests: detail add/update/remove, stock blocking and deleted-product recovery; header/toast/API consistency |
| Cart `/cart` | Signed in | Covered | 3 tests: multi-item quantities/totals/removal, confirmed clear and checkout navigation |
| Checkout `/checkout` | Signed in | Covered | 4 tests: order creation/address/cart clear/stock deduction, required address, empty cart and stock-conflict preservation |
| Order detail `/orders/:id` | Signed in | Covered | 1 test: own order/address, cancellation confirmation, persisted status and stock restoration; client controls |
| Profile & orders `/profile` | Signed in | Covered | 2 tests: personal details and both prompts persist with feedback; history filtering and order navigation; MFA deferred |
| Users `/users` | Signed in; admin actions | Covered | 2 tests: client directory without admin controls; admin deletion of a disposable user |
| Edit user `/users/:username/edit` | Admin | Covered | 3 tests: admin save, cancel populated changes without persistence, direct client denial |
| Send email `/email` | Signed in | Navigation | Send to local outbox and verify feedback/delivery |
| QR generator `/qr` | Signed in | Navigation | Generate and verify decoded content |
| AI overview `/llm` | Signed in | Navigation | Open each of the three modes |
| AI chat `/llm/chat` | Signed in | Planned | Stream response and send a follow-up |
| AI generation `/llm/generate` | Signed in | Planned | Generate output with deterministic mock |
| AI tools `/llm/tools` | Signed in | Planned | Tool execution and final response |
| Traffic monitor `/traffic` | Signed in | Navigation | Filter events and inspect request details |
| Admin dashboard `/admin` | Admin | Covered | 2 tests: low-stock product/editor link and client denial; aggregate metric boundaries remain |
| Admin products `/admin/products` | Admin | Covered | 2 tests: isolated product details and confirmed deletion; client denial; UI-12 open |
| Add product `/admin/products/new` | Admin | Covered | 2 tests: UI creation with catalog/API persistence and client denial |
| Edit product `/admin/products/edit/:id` | Admin | Covered | 2 tests: save product fields/stock with reload/API checks and client denial |
| Admin orders `/admin/orders` | Admin | Covered | 2 tests: filter, open order, save status and re-filter; client denial; UI-12 open |
| Admin inventory `/admin/inventory`, `/admin/inventory/:productId` | Admin | Covered | 2 tests: search/select, adjust stock and movement persistence; client denial for list/detail |

**Test reconciliation:** 52 screen tests (login 5, registration 4, home 8, products 5, detail 3, cart 3, checkout 4, order 1, profile 2, users 2, edit user 3, dashboard 2, admin products 2, add product 2, edit product 2, admin orders 2, inventory 2) + 16 shared-header tests = **68**. Five screens have navigation checks only; five are planned.

## Next priorities and prerequisites

1. Commerce/profile and admin priorities are automated using disposable API setup and cleanup. Extend remaining behavior by risk: order ownership/status boundaries, history pagination and dashboard aggregates.
2. Fix and retest [UI-12](bugs/ui/README.md) admin table clipping; other known UI findings remain open. Preserve shared admin data in future coverage.
3. Recovery/SSO/MFA need reset-token access, a configured test identity provider and disposable MFA enrollment. Email needs a local outbox; AI needs the deterministic mock.
4. Complete QR, AI modes and traffic behavior; add regressions for agreed [UI findings](bugs/ui/README.md) after fixes. Passing tests do not close known defects.

## Counting and maintenance

One row is one screen/workflow, regardless of record IDs or role. Create/edit product are separate workflows; inventory selection is a state of the same master/detail screen. `/orders` redirects to profile and is not another screen. Profile sections, MFA/login steps, dialogs and headers belong to their host screen/component; frontend unit tests and API fixtures do not count here. Access labels describe frontend restrictions, not verified backend authorization.

Update this snapshot when routes or UI specs change: reconcile rows/statuses, coverage percentage, test totals and next priorities. Refresh execution evidence only after a run. Follow the skill's [plan guidance](../.codex/skills/ui-testing/references/test-plan.md); keep detailed findings in the bug register and scratch evidence under ignored `exploration/ui/`.
