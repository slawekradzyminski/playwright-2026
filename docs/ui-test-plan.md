# UI test plan

**Last verified: 2026-09-11.** [UI Testing skill](../.codex/skills/ui-testing/SKILL.md) · [Frontend routes](https://github.com/slawekradzyminski/vite-react-frontend/blob/41e177a6e4b4f53ffb75d0e37b0666dcb9508277/src/AppRoutes.tsx) · [Tests](../tests/ui) · [Bug register](bugs/ui/README.md)

## Coverage and last execution

**3/27 screens (11.1%); 24 remaining.** Count a screen when a dedicated active screen spec asserts its behavior beyond opening its URL/root. This measures screen breadth, not complete workflows, roles, accessibility or visual coverage. **Covered** = behavioral tests; **Navigation** = destination checks only; **Planned** = no current UI assertions. Headers are shared components, excluded from the denominator.

Last run: `npm run test:ui` — **33 passed, 0 failed, 0 skipped (5.1s)** at `http://localhost:8081`, Chromium, desktop **1920 × 1080**. Source inventory: frontend revision `41e177a`; deployed revision unverified. CLI sign-in and read-only admin/AI navigation confirmed the additional views; this was an inventory check, not full screen exploration.

| Screen / route | Access | Coverage | Automated now / next behavior |
|---|---|---|---|
| Login `/login` | Guest | Covered | 5 tests: sign-in, required/invalid credentials, registration/recovery links |
| Registration `/register` | Guest | Covered | 4 tests: creation, required fields, duplicate username, sign-in link |
| Forgot password `/forgot-password` | Guest | Navigation | Request recovery for a disposable account |
| Reset password `/reset` | Guest + reset token | Planned | Reset and sign in; invalid/expired token |
| SSO callback `/auth/sso/callback` | SSO flow | Planned | Complete exchange; reject invalid callback |
| Home `/` | Signed in | Covered | 8 tests: identity after reload and seven shortcuts |
| Products `/products` | Signed in | Navigation | Search/filter catalog and select a product |
| Product detail `/products/:id` | Signed in | Planned | Details and add to cart; unavailable product |
| Cart `/cart` | Signed in | Navigation | Change quantity/remove items; totals and empty state |
| Checkout `/checkout` | Signed in | Planned | Submit an order from an API-seeded cart |
| Order detail `/orders/:id` | Signed in | Planned | Own order content/status and permitted cancellation |
| Profile & orders `/profile` | Signed in | Navigation | Save profile/prompts; order history; MFA setup/recovery |
| Users `/users` | Signed in; admin actions | Navigation | Directory; admin edit/delete on disposable users |
| Edit user `/users/:username/edit` | Admin | Planned | Save changes; deny client access |
| Send email `/email` | Signed in | Navigation | Send to local outbox and verify feedback/delivery |
| QR generator `/qr` | Signed in | Navigation | Generate and verify decoded content |
| AI overview `/llm` | Signed in | Navigation | Open each of the three modes |
| AI chat `/llm/chat` | Signed in | Planned | Stream response and send a follow-up |
| AI generation `/llm/generate` | Signed in | Planned | Generate output with deterministic mock |
| AI tools `/llm/tools` | Signed in | Planned | Tool execution and final response |
| Traffic monitor `/traffic` | Signed in | Navigation | Filter events and inspect request details |
| Admin dashboard `/admin` | Admin | Navigation | Correct summary and section links |
| Admin products `/admin/products` | Admin | Planned | List and delete an isolated product |
| Add product `/admin/products/new` | Admin | Planned | Create product and verify persistence |
| Edit product `/admin/products/edit/:id` | Admin | Planned | Save product changes and verify persistence |
| Admin orders `/admin/orders` | Admin | Planned | Filter orders and update allowed status |
| Admin inventory `/admin/inventory`, `/admin/inventory/:productId` | Admin | Planned | Select stock, adjust quantity and verify movement history |

**Test reconciliation:** 17 screen tests (login 5, registration 4, home 8) + 16 shared-header tests (guest 4, authenticated 12) = **33**. Ten additional screens have navigation checks only; fourteen are planned.

## Next priorities and prerequisites

1. Products → detail → cart → checkout → order detail, then profile/order history. Use isolated API-created users/products/orders and cleanup.
2. Admin catalog, orders, inventory and user editing. Cover client denial as well as admin success; use disposable records, preserving shared admin credentials/data.
3. Recovery/SSO/MFA need reset-token access, a configured test identity provider and disposable MFA enrollment. Email needs a local outbox; AI needs the deterministic mock.
4. Complete QR, AI modes and traffic behavior; add regressions for agreed [UI findings](bugs/ui/README.md) after fixes. Passing tests do not close known defects.

## Counting and maintenance

One row is one screen/workflow, regardless of record IDs or role. Create/edit product are separate workflows; inventory selection is a state of the same master/detail screen. `/orders` redirects to profile and is not another screen. Profile sections, MFA/login steps, dialogs and headers belong to their host screen/component; frontend unit tests and API fixtures do not count here. Access labels describe frontend restrictions, not verified backend authorization.

Update this snapshot when routes or UI specs change: reconcile rows/statuses, coverage percentage, test totals and next priorities. Refresh execution evidence only after a run. Follow the skill's [plan guidance](../.codex/skills/ui-testing/references/test-plan.md); keep detailed findings in the bug register and scratch evidence under ignored `exploration/ui/`.
