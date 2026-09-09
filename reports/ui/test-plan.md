# UI test plan and status

**Updated: 2026-09-09 · UI-T01–T04 implemented and verified; broader UI coverage remains in progress.**

Screen coverage measures target-screen assertions, separately from execution health. The route inventory remains **28 screen variants + 1 redirect**; no routes changed.

| Question | Current status |
| --- | --- |
| What changed? | Reviewed the pending UI diff; separated cart, checkout and route-navigation specs, clarified scenario names and page-object responsibilities, and tightened table-cell assertions/save synchronization. **43 tests** now cover T01–T04, up from 41 by splitting two mixed scenarios. |
| What is implemented? | **17/28 screens (61%)** have partial functional coverage; **4** navigation only; **7** have no screen assertions. |
| What passed? | `npm run test:ui -- --trace on`: **115 passed, 0 failed, 0 skipped**, Chromium desktop, 24.7s. |
| What remains? | Open bugs, deeper state/pagination/concurrency coverage, and UI-T05–T08. Passing tests do not establish complete accessibility, visual quality or performance. |
| Next action | Address BUG-041–046 and add their regressions after verification; then UI-T05 user management. |

## Execution evidence

| Scope | Date / environment | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Baseline inventory and suite | 2026-09-09 · local gateway | 28 variants + redirect; 72 tests passed | Frontend revision `41e177a`; deployed revision unknown. [Baseline log](../exploration/ui/2026-09-09-screen-inventory-01/ui-suite-current-paths.log). |
| First expanded full run | 2026-09-09 · `http://localhost:8081` · Chromium desktop | 112 passed, 1 failed, 21.6s | Dashboard page-object method removed by mistake; restored before rerun. [Failed run](../exploration/ui/2026-09-09-orders-root-01/ui-suite-final.log). Earlier delegated run also exposed two corrected order-selector/wait issues. |
| Final expanded full run | Same environment | **113 passed**, 0 failed/skipped, 21.3s | [Verified log](../exploration/ui/2026-09-09-orders-root-01/ui-suite-verified.log). No API suite run; API clients support UI fixtures. |
| Readability refactor | 2026-09-09 · local gateway · Chromium desktop | **113 passed**, 0 failed/skipped, 21.7s | [Run log](../exploration/ui/2026-09-09-readability-review/ui-suite.log). Same 41 new scenarios and screen breadth; order checks now match product IDs and verify rendered item count. |
| Home redirect simplification | 2026-09-09 · Chromium desktop | **7 passed**, 0 failed/skipped, 1.8s | Removed the synthetic AdminAccessPage; customer admin-route checks use HomePage.assertLoaded(), which checks the home URL, root and welcome heading. [Focused log](../exploration/ui/2026-09-09-readability-review/home-redirect.log). Full-suite result above predates this narrow change. |
| Stock-conflict readability | 2026-09-09 · Chromium desktop | **4 cart/checkout tests passed**, 0 failed/skipped, 3.5s | API setup/readback moved into a dedicated checkout fixture; real CheckoutPage owns submit/response synchronization and retained-address checks. [Focused log](../exploration/ui/2026-09-09-readability-review/stock-conflict.log). Same scenario breadth; all five address fields now checked. |
| Full diff review and spec organization | 2026-09-09 · local gateway · Chromium desktop | **115 passed**, 0 failed/skipped, 21.3s | [Verified log](../exploration/ui/2026-09-09-readability-review/suite-reorganized.log). Two mixed scenarios split; same screen breadth. Cart2, checkout3; route-access specs under navigation. |
| Exploration | Playwright CLI; desktop/tablet/mobile and breakpoint sampling | Live primary journeys; selected controlled failures and dashboard pagination boundary | [Consolidated review](../exploration/ui/2026-09-09-orders-root-01/review.md). Evidence is workspace-only and Git-ignored. Actual 200% zoom confirmed by browser metrics; blank/clipped scrolled captures prevent full zoom visual sign-off. |

Disposable fixtures were cleaned up. During delegated exploration, seeded order 3 was accidentally changed; the supervisor restored PENDING and verified unchanged stock. Its `updatedAt` changed. This is an exploration limitation, not a product defect.

## Implemented coverage

| Level | Screens | Assertions |
| --- | --- | --- |
| Partial functional · **17** | Login, registration, home, catalog, product details, profile, QR | Existing assertions; profile now also covers order navigation, filtering and cancellation |
| | Cart, checkout, order details | Quantities/totals/persistence, address validation, creation/cart clearing, stock-conflict recovery, cancellation and owner/non-owner/admin access |
| | Admin dashboard, product list/create/edit, admin orders, inventory list/inspector | CRUD/persistence, filters, signed stock/movements/conflict recovery, status workflow; live product metrics and controlled order metric/empty states |
| Navigation only · **4** | Users, email, LLM overview, traffic | Arrival/root/title assertions |
| None · **7** | Forgot password, reset, SSO callback, user edit, LLM chat/generate/tools | No target-screen assertions |

No screen is fully covered. See [coverage-map.json](coverage-map.json) for exact spec mapping and remaining work. Anonymous direct-route and client admin-route checks supplement the screen assertions.

## Work packages

| Priority | Package | Status / remaining work |
| --- | --- | --- |
| P0 | UI-T01 — Cart and checkout | Implemented: 5 tests: 2 cart and 3 checkout. Remaining: rapid duplicate submit, generic submission failure, concurrent carts; BUG-042. |
| P0 | UI-T02 — Orders and access | Implemented: 25 tests; route checks live under navigation. Remaining: pagination growth, full transition/concurrency/error matrix; BUG-009/041. |
| P1 | UI-T03 — Admin products | Implemented: 4 tests. Remaining: image URL, missing product, service failure and referenced deletion; BUG-008/043/044. |
| P1 | UI-T04 — Inventory/admin orders | Implemented: 9 tests. Remaining: deterministic multi-page boundaries, idempotency, unavailable dashboard, BUG-045/046. |
| P1 | UI-T05 — User management | Not started: edit/delete/cancel, persistence and client restrictions; disposable target user. |
| P1 | UI-T06 — Recovery/MFA/SSO | Not started: lifecycle and callback states with controlled tokens/provider. |
| P2 | UI-T07 — LLM | Not started: streaming/results, stop/retry/settings; available model. |
| P2 | UI-T08 — Utilities/existing gaps | Not started: email, traffic, detail cart actions and QR gaps; authorized recipient for live email. |
| Each package | UI-T09 — Quality review | Applied to T01–T04; responsive, keyboard/axe, UX and repeated local timing. Zoom capture limitation and remaining growth/error states are explicit in review. |

## Risks and bugs

New confirmed reports: **BUG-041** unnamed order-status select; **BUG-042** checkout contrast; **BUG-043** silent blank-description create rejection; **BUG-044** clipped admin tables; **BUG-045** keyboard-inaccessible inventory rows; **BUG-046** first-50 dashboard aggregation. See the [bug index](../bugs/README.md). BUG-046 was reproduced with injected pagination data, not persisted bulk orders. Existing findings remain open despite passing tests.

Controlled dashboard responses prove complete-page arithmetic and empty rendering, not live multi-page aggregate correctness. Local performance samples are small and have no SLA. Accessibility scans are supplemented by keyboard/manual review and are not a compliance certification.

## Keeping this plan current

Always update this plan after a work package, meaningful coverage change or verification run, including failures. Keep the summary, package status, assertions, gaps, bugs and next action current. Update affected [screen inventory](coverage-map.json) entries, counting target-screen assertions rather than fixture calls. Recheck route counts only when routes change; keep execution results separate from breadth.

Follow the [UI testing skill](../../.agents/skills/ui-testing/SKILL.md) and run `npm run test:ui` for test changes. Plan-only edits need link/count consistency checks, not live scenarios. No spec hashes or separate backlog are required.

## Resource factory refactor — 2026-09-09

`npm run test:ui -- --trace on`: **115 passed, 0 failed/skipped**, 24.7s, local gateway Chromium desktop. [Local log](../exploration/resource-factories/ui-suite.log). Product setup/cleanup is shared with API fixtures, and order browser authentication no longer creates products. The missing-order trace contains one customer creation, no product creation, and no `orderSetup`/`orderProducts` fixtures. Teardown deletes the account before the product owner.

[BUG-047](../bugs/[L][F]-BUG-047-order-route-rounds-large-identifiers.md) records rounding of large route IDs discovered during exploration. The ordinary missing-order case now uses an exactly representable ID and explicitly asserts 404. Large-ID UI support remains uncovered pending a fix. Screen/endpoint breadth is unchanged. [Exploration review](../exploration/resource-factories/review.md) and traces are ignored/workspace-only; deployed revision remains unknown.

### Factory directory extraction

Product/account creation and cleanup plus order setup now live in the dedicated `factories/` directory. UI fixtures keep the same dependency graph and scenario interfaces. `npm run test:ui`: **115 passed**, 0 failed/skipped, 22.1s, configured Chromium desktop. [Local log](../exploration/resource-factories/ui-directory.log). No screen or target-assertion changes in this extraction.
