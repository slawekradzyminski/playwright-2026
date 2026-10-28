# GraphQL testing discovery and implementation backlog

## Recommendation

Add a dedicated GraphQL API suite and a focused set of commerce UI scenarios. Keep the existing REST suite and reuse its data lifecycle. Completion should mean explicit coverage of the **9 query fields and 11 mutation fields**, representative authorization and business failures, and browser evidence that the storefront uses GraphQL correctly. A successful request to the one GraphQL URL or a selected dropdown value is insufficient.

This document prepares implementation; it does not add automated coverage. Current coverage remains **0 / 20 GraphQL root fields** in this repository, alongside **31 / 55 REST endpoints** and **6 / 29 UI screens**. Exploratory checks and tests in the application repositories do not increase these counts.

## Implementation and existing evidence

| Layer | What exists | Consequence for this project |
| --- | --- | --- |
| Backend | `POST /api/v1/graphql`; SDL, thin controllers, secured query/mutation facades, shared commerce services, explicit Bean Validation, error mapping, depth/complexity/body limits | Test GraphQL binding, projection, authorization and errors through the gateway, plus important persisted business transitions |
| Frontend | `commerceTransport.ts` chooses the adapter at module load; Shop API saves `commerceTransport` in sessionStorage and reloads the current page | Test actual requests, reload, route/login retention, independent browser contexts and switching in both directions |
| GraphQL adapter | Converts string IDs and decimal money to existing UI types, maps pages, fetches catalog in pages of 25, supplies enriched cart data | Verify real schema compatibility, later catalog pages, totals and cart presentation; retain detailed conversion cases in frontend unit tests |
| Authentication | Same JWT and Axios instance as REST; login, refresh, identity and non-commerce features remain REST | Allow legitimate REST identity/refresh requests in GraphQL UI scenarios. Forbid fallback only for commerce operations |
| Backend tests | `CommerceGraphQlTest`, `CommerceAuthorizationTest`, `CommerceMutationsTest`, `GraphQlDefaultAvailabilityTest`, `CommercePerformanceTest`, `GraphQlConcurrencyIT` | Existing source covers auth, partial errors, mutation flows, limits, query counts and concurrency. Preserve those lower-level gates; do not recreate SQL-count or database-race suites in browser tests |
| Frontend tests | Schema-backed `commerceGraphql.test.ts`, transport and selector unit tests; `e2e/commerce/transport.spec.ts` exercises both transports, checkout/cancel, refresh, inventory and injected errors | Useful scenario references, not evidence that this repository runs those checks. Do not copy their fixtures unchanged |
| This repository | REST clients, test-scoped API ownership/cleanup, authenticated UI fixtures and catalog/detail/cart page objects | Extend these abstractions instead of introducing a second fixture framework |

The upstream commerce browser fixture has hardcoded demo administrator credentials and no resource teardown. Its error test intercepts the entire GraphQL endpoint. Port the useful behavior using environment credentials, finally-based cleanup and operation-specific interception. The selector unit test registers a synthetic React Query mutation, so it cannot establish that real cart components participate in that guard.

### Source references

- Backend reference: [`3152f6cc331940c6d89eb6eff8e4b5a7b820079e`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e), especially [SDL](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/resources/graphql-preview/commerce.graphqls), [GraphQL package](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/graphql), [guide](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/docs/GRAPHQL.md), shared services, security and GraphQL tests.
- Frontend reference: [`7392a3a935b373f3160c5a3ae4162c5b2f310624`](https://github.com/slawekradzyminski/vite-react-frontend/tree/7392a3a935b373f3160c5a3ae4162c5b2f310624), especially [adapter](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/lib/commerceGraphql.ts), [selector](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/components/layout/CommerceTransportSelector.tsx), [transport state](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/lib/commerceTransport.ts), [storefront guide](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/docs/GRAPHQL_STOREFRONT.md) and [commerce browser suite](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/e2e/commerce/transport.spec.ts).

## API scope and assertions

Inventory unit: `Query.<field>` or `Mutation.<field>` from SDL. Client operation names, aliases, selections, roles and transports are scenarios, not extra inventory entries. Introspection and HTTP envelope checks are cross-cutting scenarios. The frontend adapter uses 19 of these 20 fields; `Query.carts` is an API-only admin capability.

| Area | Query fields | Mutation fields | Required representative behavior |
| --- | --- | --- | --- |
| Products (5) | `products`, `product` | `createProduct`, `updateProduct`, `deleteProduct` | Catalog/filter/page and detail values; admin CRUD; client denial; missing detail; invalid input; omitted/null update preserves fields; referenced-delete conflict and missing-delete false |
| Cart (6) | `cart`, `carts` | `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart` | Own cart by default; additive add, absolute update, zero removes, remove/clear; totals; no stock reservation; admin explicit-owner/list access; client foreign-owner/list denial; invalid quantity, missing item, stock conflict and unchanged state |
| Orders (5) | `orders`, `order` | `checkout`, `cancelOrder`, `updateOrderStatus` | Own history/details; admin all/filter and status changes; checkout creates owned order, clears cart and deducts stock; cancellation restores once; empty/insufficient-stock checkout; foreign order read is NOT_FOUND and foreign cancellation is FORBIDDEN |
| Inventory (4) | `inventory`, `inventoryItem`, `inventoryMovements` | `adjustInventory` | Admin filters/detail/history and adjustment; client denial; exact quantity/movement/actor; same UUID and payload returns same movement; changed payload conflicts; no negative stock or repeated adjustment |

For each success assert expected HTTP status/content type, no GraphQL errors, the selected data and wire types. For mutations verify saved state independently and check relevant cart/order/stock effects. Use known input values as the oracle. GraphQL IDs are strings and money is a decimal string; do not reuse REST numeric DTOs as the GraphQL wire contract. Compare monetary values exactly in integer minor units or equivalent exact parsing.

Distinguish these failure layers:

| Layer | Representative cases | Assertion policy |
| --- | --- | --- |
| HTTP/security | No/invalid token, malformed JSON, array batching, body >64 KiB | Assert actual transport status and appropriate body; observed statuses are 401, 400, 400 and 413 respectively |
| GraphQL document/coercion | Unknown field, invalid scalar/enum, required variable absent/null, invalid operationName | Assert errors and no resolver side effects. Do not demand a business `extensions.code` for framework validation errors |
| Resolver/business | Invalid quantity/page/input, denied role/owner, missing entity, stock/idempotency conflict | Assert `errors[].extensions.code`, affected field null and `path`, plus unchanged state on rejection. Observed application codes: BAD_REQUEST, FORBIDDEN, NOT_FOUND, CONFLICT with HTTP 200 |
| Mixed execution | Allowed catalog + forbidden inventory via alias/fragment | Assert allowed data survives and only the denied alias is null; error path uses the alias |
| Multiple mutation roots | Valid mutation followed by a failing mutation | Assert the first transaction remains committed. The envelope is not an atomic batch; do not retry the whole document |
| Resource protections | Depth >20, complexity >1000 including aliases/page sizes | Assert rejection before business writes. Keep probes bounded; do not load-test the shared environment |

Pin `Accept` explicitly in transport tests. The exploratory POSTs used JSON; other media-type behavior must be explored before adding exact assertions. The initial combined introspection probe hit the framework's BadFaithIntrospection guard; separate Query and Mutation introspection succeeded. Do not classify every introspection rejection as missing GraphQL support.

Security depth belongs in explicit cases: anonymous/invalid-token boundary; customer A versus customer B; admin access; foreign username on all four cart mutations; admin-only product, inventory and order-status mutations; aliases/fragments/mixed roots. Denial must leave state unchanged. Listing other customers' data in admin tests should filter to or assert containment of test-owned records rather than snapshotting shared data.

REST↔GraphQL parity means equivalent business state, ownership and effects. It does not mean identical JSON, HTTP statuses, pagination metadata, order defaults or timestamps. In particular, unfiltered admin GraphQL `orders` means all users, while the profile must explicitly request its own username. Price snapshots are documented; [API question Q1](../bugs/api/QUESTIONS.md) remains a product decision. Avoid asserting current catalog price equals every existing cart/order price.

## UI scope

Keep the existing REST UI suite as the baseline. Add explicit GraphQL scenarios on the same screens, sharing page objects and owned-data fixtures. Do not multiply every authentication, layout, field-validation or accessibility test by transport.

| Scenario group | Acceptance criteria |
| --- | --- |
| Selector and persistence | Fresh independent context defaults to REST; REST→GraphQL→REST preserves current route, authentication and saved cart; reload retains the selected mode; independently created contexts have independent preferences. Treat opener/duplicated-tab sessionStorage behavior separately, not as guaranteed fresh-tab reset |
| Catalog and details | GraphQL catalog, detail and own cart data render correctly; a test-owned item beyond the adapter's first 25 results is visible; add/update/remove through UI persists via an independent read |
| Cart | GraphQL enriched names/prices/quantities/totals, quantity change/removal/clear and reload; no per-item product-detail enrichment requests for an already enriched cart. Verify relevant operation identity, not exact incidental request counts |
| Purchase | Checkout → owned order detail/history → cancellation; visible totals/status, saved address/items, cart clearing and stock deduction/restoration; customer and admin profile history remain own-user scoped |
| Administration | Representative GraphQL product create/edit/delete; admin order list/status; inventory list/detail/adjustment/history. Use only owned entities and permitted admin fixtures; verify visible outcomes and independent saved state |
| Failure and recovery | Operation-specific HTTP 200 + errors for reads and writes; real stock conflict; retry after read failure; mutation rejection preserves data; session remains signed in; no commerce REST fallback |
| Session and uncertain writes | Pre-execution 401 triggers coordinated refresh and resumes the intended operation; execution FORBIDDEN/CONFLICT does not refresh/logout. Hold checkout and verify duplicate-submit prevention; lost/uncertain mutation responses must not trigger automatic business retries |
| Pending writes | Hold real catalog/detail/cart/checkout/inventory writes; switching is disabled and click-time guard rejects it; after success/failure switching becomes available. Add correct-behavior regression with the application fix |
| Responsive/keyboard | Explore desktop 1920×1080, phone 402×874 and tablet 820×1180 / 1180×820 with touch emulation; selector is labelled, keyboard usable and reachable. Keep selected mobile regressions local rather than duplicating the entire suite |

Attach network observation before navigation/action and wait for the relevant operation and visible result. For fault injection parse the POST envelope and match the intended operation, so a cart failure does not also replace product, order or inventory responses sent to the same URL. A targeted assertion that a write uses GraphQL is justified here; generic request counters are unnecessary. Setup and independent REST verification requests are not browser fallback.

Use sessionStorage deliberately: Playwright storageState preserves the existing auth localStorage, not the selected sessionStorage transport. For isolated business tests set transport once before the first application load with a scoped initializer or bootstrap; use the real selector for selector/switch scenarios. Never have an initializer repeatedly overwrite a user's switch on navigation, and do not set it to GraphQL before a REST-default test.

## Findings and quality assessment

The backend has useful separation between transport and business logic, service-level role/owner checks, transaction boundaries and exact decimal output. The adapter reuses authentication, rejects execution errors, validates ID conversion and avoids cart N+1 HTTP enrichment. Runtime probes supported these behaviors; this is not a complete security or performance audit.

| Finding | Evidence and effect | Work |
| --- | --- | --- |
| Pending cart writes bypass selector guard | Existing [BUG-0023](../bugs/ui/BUG-0023-transport-switch-during-cart-mutation.md). Also runtime-confirmed on product details in GraphQL: Update Cart disabled while Shop API stayed enabled. Detail/catalog writes use local flags, while selector observes React Query's mutation cache | Frontend fix across real write entry points; regression for actual pending writes. `CartItem` and `CartSummary` show the same direct-call pattern in source, but their guard behavior was not re-probed in this session |
| Failed cart read becomes empty state on product surfaces | Existing [BUG-0022](../bugs/ui/BUG-0022-cart-read-failure-treated-as-empty.md). Also runtime-confirmed on GraphQL product details: owned cart held one unit, injected Cart execution error produced Add to Cart. Standalone cart correctly showed its error and recovered | Shared read-state handling for catalog/details; regression with existing cart + failure + recovery. Do not encode the misleading Add state as expected |
| Cart mutation failures have inadequate visible feedback | Existing [BUG-0025](../bugs/ui/BUG-0025-cart-update-failure-has-no-feedback.md); direct-call catch paths in CartItem only log/reset. GraphQL-specific cart mutation failure was not re-probed here | Include GraphQL HTTP-200 execution errors in the fix's regression scope; preserve independent saved-state assertions |
| Frontend commerce E2E fixture is unsuitable for direct reuse | Static finding: hardcoded admin login and no finally/teardown in the referenced upstream browser suite | Reimplement fixtures with this repository's credentials and ownership lifecycle; keep useful scenarios |
| REST-only skill assumptions misdescribe GraphQL | API skill description says REST, inventory counts method+route, automation requires one file per route and orders by status | Add explicit GraphQL guidance before implementing the suite; preserve existing REST conventions |

Shared DTO/storage/input issues and order lifecycle decisions already recorded in `bugs/api/` are not automatically new GraphQL bugs. Where the same service is involved, extend the established report after GraphQL reproduction rather than duplicating it. Do not silently adopt disputed pricing, cancelled-order reactivation or user-deletion stock semantics as new test requirements.

## Ordered work packages

| ID / order | Deliverable and likely files | Done when / dependency |
| --- | --- | --- |
| GQL-01 — foundation | Extend `.agents/skills/api-testing/SKILL.md` and references for SDL/introspection, envelopes, operation coverage and spec organization; add a short GraphQL integration section to UI automation. Update README commands/conventions. Run `npm run skills:sync` and `npm run skills:check` | GraphQL has explicit rules without changing REST counts or UI screen definitions; `.claude/skills/` identical. Define an exception allowing domain-grouped GraphQL specs under `tests/api/graphql/` rather than one giant POST spec |
| GQL-02 — clients and lifecycle | `http/graphql-client.ts`, `types/graphql.ts`, focused documents/support under `tests/api/graphql/`; extend `ApiTestContext` with minimal admin GraphQL access and owned GraphQL-created-product tracking | Generic execute returns raw response/envelope for negative tests; positive assertion helper rejects errors. Reuse existing user/product cleanup, record ownership before assertions can fail. REST setup/cleanup remains valid |
| GQL-03 — API contract and security | Domain specs such as `products.graphql.api.spec.ts`, `cart.graphql.api.spec.ts`, `orders.graphql.api.spec.ts`, `inventory.graphql.api.spec.ts`, plus focused transport/security specs | All 20 fields explicit test subjects, representative failures and role/owner matrix; assertions cover wire data, partial results and persisted effects. Requires GQL-01/02 |
| GQL-04 — state and parity | Cross-protocol scenarios using existing REST clients and the GraphQL client | REST write→GraphQL read and GraphQL write→REST read; checkout/cancel/stock and inventory UUID retry behavior correct. Single mutation rollback and separate mutation transactions distinguished. Can live in GQL-03 specs; no parallel framework |
| GQL-05 — client UI | Shared `pages/components/commerce-transport.component.ts`; extend authenticated UI fixture with optional mode; focused commerce specs using catalog/detail/cart page objects; add checkout/order/profile page objects only as needed | Customer journey, real GraphQL requests, switching/reload, later catalog pages, execution-error/recovery/session behavior and responsive selector verified. Requires GQL-02 and relevant GQL-03 probes; unaffected cases can proceed before frontend fixes |
| GQL-06 — application fixes and regressions | Frontend repository fixes for BUG-0022/0023/0025; relevant API bug fixes only if separately reproduced; then passing focused regressions here | Pending writes tracked consistently; unknown cart distinct from empty; visible mutation failure and recovery. No permanent skipped/expected-failure tests documenting known wrong behavior |
| GQL-07 — admin UI and execution gate | Reuse read-only `adminTest` for reads; explicitly scoped mutation fixture for owned products/inventory/order administration. Add `test:graphql` / `test:ui:graphql` scripts and connect checks to the project's chosen CI runner | Shared admin account, roles and sessions unchanged; owned entity writes cleaned. Focused suites plus affected shared suites pass against identified gateway/images; no silent GraphQL skip/fallback. Requires GQL-02/03; agree runner provisioning if automation infrastructure is elsewhere |

The current `adminTest` is explicitly read-only. Extend the fixture policy for admin mutations against owned resources without modifying/logging out the shared admin or faking its role. A disposable administrator needs a supported provisioner; the public API cannot promote one. Do not block ordinary customer or API work on that separate fixture decision.

Implementation verification: run `npx tsc --noEmit`, skill checks when skills change, and affected GraphQL API/UI specs with `--retries=0`. Broaden to `npm run test:api` or affected REST/UI suites when shared fixtures/clients/page objects change. `npm run test:api` will already include specs placed in `tests/api/graphql/`; focused scripts supplement that command. A typecheck or test collection is not a runtime pass. CI must supply the compatible application and credentials, fail clearly when GraphQL is unavailable, and retain sanitized failure evidence. Existing retries must not mask duplicate business effects or known application defects.

### Completion criteria for the GraphQL task

1. SDL inventory reconciled with authenticated live introspection; explicit active API coverage is **20 / 20 fields**, with transport, authorization, ownership, mixed errors and representative business failures tracked separately.
2. Successful and rejected mutations verified against saved state and related stock/cart/order effects; parity and inventory idempotency cases pass.
3. Focused client and admin browser scenarios prove real GraphQL traffic and visible outcomes, with switching, reload, session/error handling and the listed defect regressions passing after fixes.
4. Existing REST behavior remains covered; modes do not add UI screens or inflate REST endpoint counts. New direct checkout/order/profile/admin functionality updates screen coverage only when actually implemented.
5. Skill copies, plans, README and execution commands agree; cleanup works on assertion/setup failures and no secrets or demo credentials enter tracked test code.
6. Required suites pass against an identified compatible environment with no hidden skips, expected failures or fallback. Open risks/decisions are recorded. Operation presence is not a claim of exhaustive GraphQL, security or accessibility coverage.

## Discovery verification and limits

Performed 2026-10-28 through `http://localhost:8081`. Backend image 3.9.4 reports revision `fd4c015434dd573f26bf8ff6691ff14611e2f247`; frontend image 3.9.1 reports `607fe6be7f3be33ed2e7f47d78957b18b63cb81b`. Startup logs show `graphql, local`. The relevant backend GraphQL/services/security/schema/application configuration and frontend `src` files have no diff against the reference revisions above. These are image-label/source comparisons, not independent build-attestation proof. The original backend checkout's uncommitted ignored-variable rename was left untouched; analysis used a committed read-only scratch clone.

Source-first curl exploration fetched OpenAPI (55 REST operations; GraphQL intentionally absent), authenticated introspection (9 queries/11 mutations), then exercised all 20 fields as discovery requests, not automated tests. Checks included role/owner rejection, aliases/fragments/partial data, operationName, invalid inputs, HTTP envelope/body limits, depth/complexity rejection, all cart mutations, cross-protocol cart state, checkout/cancel/stock, inventory retry conflicts and product update/delete semantics. Example: price 12.50 × 2 yielded decimal string 25.00; checkout stock 8→6; cancellation 6→8; duplicate adjustment returned the same movement and quantity 10; altered UUID payload returned CONFLICT. Separate mutation roots left a successful first write committed after the second failed.

Playwright CLI Chromium exploration checked a real GraphQL detail add/update and cart, switching/default/reload/auth retention, operation-specific Cart execution errors, recovery, and the pending-detail-write guard. Responsive selector/cart checks used 1920×1080 plus 402×874, 820×1180 and 1180×820; smaller contexts used touch/mobile emulation. Selector remained visible and document-level horizontal overflow was absent. Desktop/phone screenshots were inspected; this is not a complete visual/accessibility review. No uncaught page errors were recorded; an intentionally aborted held write produced expected network/console errors. No claim is made about a server-accepted request after a transport switch.

Two disposable users and one owned product were used. Both account deletions returned 204; GraphQL product deletion returned true, then false on repeat. The owned order/cart references were removed with their user; its cancelled order had already restored stock. Browser closed and temporary credential/storage-state files removed. No pre-existing resources were mutated. No new automated tests, application fixes or skill edits were made, and application-repository suites were inspected rather than rerun. Remaining runtime coverage includes full browser checkout/admin flows, refresh/lost-response behavior, complete role/argument partitions, media negotiation, storage failure, full multi-page catalog UI and database concurrency/performance. These are implementation charters, not discovered failures.
