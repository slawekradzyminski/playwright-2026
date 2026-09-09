# UI test plan and status

## Status at a glance

**Updated: 2026-09-09 · Overall: In progress — inventory verified; functional coverage incomplete.**

This is a manually maintained report, like the [API test plan](../api/test-plan.md). Screen coverage measures implemented assertions, not complete behavior or live pipeline health.

| Question | Current status |
| --- | --- |
| What did we do? | Matched frontend routes to live Playwright CLI navigation, including admin screens: **28 screen variants + 1 redirect**, with no inventory discrepancy. |
| What is implemented? | **7/28 screens (25%)** have partial functional tests; **6** have navigation checks only; **15** have no screen assertions. |
| What was verified? | Existing UI suite: **72 passed, 0 failed, 0 skipped** on 2026-09-09. No new tests were added in this planning task. |
| What is missing? | **21/28 screens lack functional coverage beyond navigation.** Major gaps: checkout/orders, admin operations, recovery/MFA/SSO and LLM. |
| What happens next? | Start **UI-T01 — cart and checkout**, then orders and direct route-access checks. |

## Execution evidence

| Scope | Date / environment | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Screen inventory | 2026-09-09 · local gateway · Playwright CLI | 28/28 screen variants observed; `/orders` → `/profile` confirmed | Frontend `AppRoutes.tsx` and page components at revision `41e177a` matched live navigation as anonymous/client/admin; deployed commit unknown. |
| Current UI suite | 2026-09-09 · `http://localhost:8081` · Chromium desktop | `npm run test:ui`: **72 passed**, 0 failed/skipped, 16.2s | 12 specs, including reorganized product/navigation paths. [Local run log](../exploration/ui/2026-09-09-screen-inventory-01/ui-suite-current-paths.log); no CI link. |

Discovery cleanup completed: disposable cart cleared, user deleted and authentication files removed. Shared products/orders were read only. Detailed evidence is local and Git-ignored.

## Implemented coverage

| Level | Screens | What the assertions cover |
| --- | --- | --- |
| Partial functional · **7** | Login, registration, home | Authentication/validation, registration, identity/reload/logout and shortcuts |
| | Catalog, product details | Search/filter/sort, product-card cart actions, detail data/out-of-stock, simulated response states |
| | Profile, QR | Personal information and prompt persistence; QR content/clear/validation; simulated failure → live retry |
| Navigation only · **6** | Users, email, LLM overview, cart, admin dashboard, traffic | Arrival/root/title checks; no primary workflow coverage |
| None · **15** | Forgot password, reset, SSO callback, user edit, LLM chat/generate/tools, checkout, order details, admin product list/create/edit, admin orders, inventory list/inspector | Not yet automated |

No screen is declared fully covered. Profile's MFA and order list remain untested. Product-card cart actions do not count as cart-screen coverage.

## To do

All packages are **not started**. Explore each feature before automation; write detailed scenarios when starting that package.

| Priority | Package | Next deliverable / dependency |
| --- | --- | --- |
| P0 | UI-T01 — Cart and checkout | Quantity/totals, shipping validation, order creation and cart clearing; disposable cart/order fixtures |
| P0 | UI-T02 — Orders and access | Profile orders → details/cancellation; owner/client/admin and anonymous direct-route checks |
| P1 | UI-T03 — Admin products | Create/edit/delete and persistence; isolated products |
| P1 | UI-T04 — Inventory/admin orders | Filters, stock adjustments/movements, order status and dashboard accuracy |
| P1 | UI-T05 — User management | Edit/delete/cancel, persistence and client restrictions; disposable target user |
| P1 | UI-T06 — Recovery/MFA/SSO | Reset and MFA lifecycle, callback success/errors; controlled tokens/provider |
| P2 | UI-T07 — LLM | Mode navigation, streaming/results, stop/retry/settings; available model |
| P2 | UI-T08 — Utilities/existing gaps | Email, traffic, detail cart actions and QR states; authorized test recipient for live email |
| Each package | UI-T09 — Quality review | Responsive/visual, keyboard/axe, UX and performance exploration; desktop-only functional automation |

## Risks and gaps

- Known bugs remain open despite passing tests: registration Sign in creates an account (BUG-028), product keyboard access (BUG-034), cart accessible name (BUG-039), profile field semantics (BUG-040). See the [bug index](../bugs/README.md).
- Discovery confirmed screen identity, not every state or role. SSO success, MFA challenge and customer-owned order details remain unexplored; new responsive, accessibility and performance reviews remain package prerequisites.
- The denominator includes create/edit and inventory list/inspector separately. `/orders` is a redirect; embedded Profile sections are tracked without adding screens. Source/browser agreement does not establish an identical deployed revision.

## Keeping this plan current

Update this file after a completed work package, a meaningful coverage change or a verification run—not after every small edit. Keep the summary, coverage table, latest result and next action current. Recheck the screen count against frontend routes and browser navigation when routes change. The agent maintains per-screen details in [coverage-map.json](coverage-map.json), updating affected entries when routes or meaningful coverage change. No separate Markdown inventory, backlog or spec-hash tracking is required.

For test changes, follow the [UI testing skill](../../.agents/skills/ui-testing/SKILL.md) and run `npm run test:ui`; keep execution results separate from coverage. Plan-only edits need link/count checks, not a live test run.
