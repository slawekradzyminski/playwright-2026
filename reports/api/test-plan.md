# API test plan and delivery backlog

Baseline: 2026-09-08. Scope: every HTTP method/path in `docs/openapi.json` (OpenAPI API version 1.0), including local-profile and infrastructure operations. Owner: the contributor changing API tests; reviewers verify the mapping and remaining risks in the same change.

## Current position

**13 of 55 operations have dedicated API tests: 23.6%; 42 remain.** Playwright discovery on 2026-09-08 found **88 tests in 13 files**. A parameterized test does not increase endpoint breadth more than once. GET and POST on the same path are separate operations. Requests in fixtures, setup, cleanup, and incidental readbacks do not establish dedicated endpoint coverage.

[Coverage inventory](coverage.md) lists all 55 operations, their exact specs, asserted response codes, and missing documented response codes. [Coverage mapping](coverage-map.json) records manually reviewed target assertions. The generator derives denominators from OpenAPI, detects changed mapped specs by SHA-256, rejects obsolete operations and unmapped specs, and exposes new contract operations as uncovered. Status coverage is also only breadth: one 400 does not cover every validation rule, and a status assertion does not prove the complete response schema.

| Area | Dedicated operations / contract operations | Current scope |
| --- | --- | --- |
| Users, sessions, MFA, prompts, password, account deletion | 2 / 24 | Signin and signup only; fixture-driven account deletion does not count |
| Products | 5 / 5 | CRUD, role rejection, validation, readback; open functional/contract gaps below |
| Cart | 5 / 5 | Ownership, totals/readback, mutations, 400/401/404, stock-conflict rollback |
| QR | 1 / 1 | Customer PNG, 400 and 401; error media-type assertions deferred |
| Orders | 0 / 6 | Entire workflow outstanding |
| Inventory | 0 / 4 | Entire surface outstanding |
| Ollama | 0 / 4 | Definitions and three streaming operations outstanding |
| Email and local outbox | 0 / 3 | Queue submission and local inspection/reset outstanding |
| Traffic | 0 / 3 | Info, list and detail outstanding |

Execution evidence is separate from coverage. The latest existing cart follow-up report records **88 API tests passed**, including **29 cart tests**, on 2026-09-08. This planning task performed discovery only, not a fresh API or backend test run. Historical exploration is in `reports/exploration` (git-ignored local evidence); preserve sanitized evidence in a durable review artifact when sharing the plan. No current green-suite or release-readiness claim is made.

## Assessment and confidence

Sources: saved OpenAPI operations, parameters and schemas; current specs, validators, clients and fixtures; BUG-001–008; product, QR and cart exploration reports; backend checkout `../test-secure-backend` at `8cb264a24ef997d635210bc5d0152363f78f8486`.

The previous cart assessment identified deployed image 3.7.16 at revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`, different from the checkout. That is historical evidence, not current deployment verification. Before each implementation batch, record the configured gateway, live `/v3/api-docs` comparison and deployed revision; do not assume source parity. Planning does not require live mutations. Unassessed areas below remain provisional until their controller, validation, authorization, persistence, error mapping and actual lower-level assertions are reviewed and terminal exploration completes.

| Behavior / risk | Evidence inspected | Coverage gap and preferred next step |
| --- | --- | --- |
| Refresh rotation and replay | Backend `endpoints/users/RefreshControllerTest.java` asserts nonblank new tokens, different refresh token, unknown/reused token 401; inspected only this turn | Keep one gateway rotation/replay flow plus representative 400. Add access-token use against `/users/me` to prove interoperability. Unit tests own token edge cases. Inspect `RefreshTokenServiceTest` before expanding cases. |
| Order creation | `OrderController` uses validated address and authenticated principal. `CreateOrderControllerTest.java` asserts 201, owner, item identity/price/quantity, totals, PENDING, address/timestamps, invalid address/empty cart 400 and anonymous 401; inspected only | A deployed flow should verify persisted order, cleared cart, inventory delta and isolation. Existing inspected creation assertions do not prove these side effects. Inspect `OrderServiceTest` and real-DB tests before selecting concurrency cases. |
| Inventory authorization and movements | `AdminInventoryControllerTest.java` asserts listing contains product, adjustment 201, actor and quantity 3, movement actor; anonymous 401/client 403 tested on listing only; inspected only | Retain actual-route 401/403 for each inventory operation and adjustment replay/readback. Inspect `InventoryServiceTest`, `InventoryConcurrencyIT` before duplicating race or arithmetic permutations. |
| Cart persistence, ownership, rollback | Existing assessment records 31 focused backend passes at local revision and terminal two-user checks; current specs verify both carts after rejection | Continue API ownership/rollback checks. Proposed lower-level gaps in that report: two-user repository operations, DTO variants, real-DB stock rejection rollback. Historical passes do not verify the currently deployed revision. |
| QR encoding | Existing assessment records decoding in backend tests and 15 focused backend passes; API validator checks PNG binary | Keep decoding permutations below the API layer. Retain gateway PNG/auth checks and tracked error contract gap. |
| Other users/MFA/SSO/password/prompts/email/traffic/Ollama | Backend test files located, but their full assertions and current execution were not assessed in this planning task | Do not credit them as verified lower-level coverage. Each work package begins with focused assertion review and source/deployment comparison. |

## Prioritized work packages

Each operation in the inventory inherits the following cases for its group: one valid response with relevant body/media-type assertions; each applicable documented 400 and 401 with representative input/auth failure; allowed and denied role/ownership identities; meaningful persisted state/readback for writes; and missing-resource responses where a safe trigger exists. Order expected statuses ascending in each spec. A documented response with no reproducible intended trigger stays a visible gap pending clarification, rather than manufacturing a failing environment.

| Package / priority | Operations (paths below use `/api/v1`) | Concrete next cases and integration risk | Dependencies / readiness |
| --- | --- | --- | --- |
| A / P0 | Existing signup, product, QR and cart specs | Review signup title vs actual 201/body-only assertion; explore signup→signin before adding authentication assertion and owned-user cleanup. Triage bugs below. Preserve representative error tests. | Can start now; changes to defective behavior wait for a verified fix. No increase in endpoint breadth. |
| B / P0 | POST users/refresh, POST users/logout, GET users/me | Refresh rotation, new access token accepted by me, replay/unknown token 401, malformed refresh 400; logout then refresh denied; me resolves correct identity and anonymous 401. | Disposable customer helper already exists. Never logout the shared admin. First new endpoint batch: +3 operations. |
| C / P0 | All six orders operations | Create from two-line cart, read owner order/list, filtering/pagination, admin list; rejected checkout preserves cart/stock; cancellation and status transitions persist with correct inventory effects; customer B cannot read/cancel A's order. Test documented 400/401/403/404 per applicable operation. | Products/cart usable now. First explore checkout and establish an owned-order fixture/cleanup, then downstream read/cancel/status specs can be developed independently. Cross-owner GET expected status requires exploration. |
| D / P0 | All four admin/inventory operations | List/filter and single read; adjustment and movement history; repeat same requestId changes stock once; conflicting replay/invalid delta and missing ID are hypotheses needing contract/source reconciliation. Each route rejects anonymous/client. | Can start alongside C using different products. Real-DB races belong in backend integration tests first. No requirement to finish orders before inventory. |
| E / P1 | GET users, GET/PUT/DELETE users/{username}, DELETE users/{username}/right-to-be-forgotten | List/detail serialization and sensitive-field absence; self/admin edit readback; other customer 403; missing user 404; admin deletion 204; forgotten account removes owned data and makes refresh unusable. | Profile/list work starts now. Full deletion cascade needs owned order/cart/token/email setup; verify cleanup before automated cascade. Never target shared identities. |
| F / P1 | POST users/password/forgot, POST users/password/reset, POST email, GET users/me/email-events, GET/DELETE local/email/outbox | Forgot 202 with non-enumerating response; capture owned reset token in test sink; reset changes login and revokes refresh; malformed/invalid/reused reset rejection; queued email correlated to owned recipient and event status. Local outbox GET contract and isolated clear. | Full async/reset flow depends on configured broker/consumer/sink and token retrieval. Local outbox exists only in local profile. No real-recipient sends as part of planning. Global clear requires a dedicated environment/exclusive lane. |
| G / P1 | GET/PUT users/chat-system-prompt and users/tool-system-prompt | Default value, write/readback, persistence, customer isolation, blank input 400 and anonymous 401 on applicable routes. | Starts now with separate users; no model service needed for prompt persistence. |
| H / P1 | GET users/2fa/status; POST users/2fa/setup, confirm, recovery-codes, disable; POST users/signin/2fa | Pending enrollment→confirm→challenge signin; wrong/expired challenge, single-use recovery, replacement invalidates old codes, disable and refresh revocation; documented conflicts/expiry 409/410. | Dedicated MFA user, TOTP generation and controlled clock/expiry strategy. Setup→confirm precedes enabled-user cases. Inspect lower-level lifecycle tests; do not duplicate every TOTP time window over HTTP. |
| I / P2 | POST users/sso/exchange | Valid exchange/provision and repeat identity; malformed 400, invalid issuer/audience/signature 401, documented 404 and conflict 409 after identifying exact triggers. | Positive flow conditional on controlled OIDC issuer/JWKS and signed token fixture. Not proven blocked; infrastructure availability is unverified. |
| J / P2 | GET ollama/chat/tools/definitions; POST ollama/generate, chat, chat/tools | Definitions schema; streaming content type, framing, completion and cancellation; caller history and product-tool grounding. 400/401 and applicable unknown-model 404. | Definitions can start now. Streams need configured model/mock; 500 fault injection requires isolated dependency control. Assert protocol/grounding, not exact prose. Tool flow needs owned product. |
| K / P2 | GET traffic/info, traffic/logs, traffic/logs/{correlationId} | Info contract, own correlation lookup, pagination/filter 400, missing correlation 404; sanitize secrets in own captured request. | Starts with uniquely correlated traffic; eventual capture uses bounded polling. Do not assert global log count/order. Exposure/auth expectations need source/contract assessment. |

## Parallel delivery and dependencies

There is **no identified global blocker**, but it would be incorrect to say everything is independent. Readiness here means a package can begin assessment/exploration, not that its runtime prerequisites have been verified.

- Wave 1: A (existing gaps), B (session lifecycle), C (checkout/fixture), D (inventory) can proceed together with independent disposable users/products. One contributor owns shared fixture/client interfaces; others consume the agreed interface. Merge common support first to avoid conflicting edits.
- Wave 2: after checkout fixture exploration, split order listing/detail, cancellation and admin status work by spec. E profile operations, G prompts, K traffic and J definitions can also start without checkout. Full E cascade joins after owned-order and email setup.
- Conditional lanes: F waits for sink/broker verification for positive delivery/reset; H runs sequentially within each MFA lifecycle but independent users allow parallel specs; I waits for OIDC fixtures; J streams wait for model/mock readiness.
- Serialize global outbox clearing, injected dependency failures and any empty-catalog scenario in a disposable environment. Never drain a shared catalog or outbox to reach a documented response.
- Cart teardown must precede product deletion (BUG-008). Order/user teardown ordering is not established by the cart fixture; explore it before extending that fixture. Do not assume cancelling an order removes its database references.
- Refresh/logout/reset/MFA scenarios must use test-owned tokens/accounts. Separate products for inventory and order work prevent shared stock races. Correlate email and traffic by run-specific values. Limit workers if gateway rate limits interfere; CI currently uses one worker, which does not prevent parallel development.

Dependency outline: `signup/signin helpers → session tests`; `owned products + cart → checkout fixture → order detail/list/cancel/status → full account cascade`; `owned products → inventory` independently; `email sink + forgot → reset`; `MFA setup → confirm → challenge/recovery/disable`; `OIDC issuer → positive exchange`; `model service → stream tests`.

Breadth milestones (assuming the same 55-operation contract): B complete gives **16/55 = 29.1%**; B+C+D complete gives **26/55 = 47.3%**. Existing defect regressions improve depth without increasing these percentages. Do not remove difficult or profile-specific endpoints from the denominator to improve the headline.

## Open defects and existing depth gaps

See [bug index](../bugs/README.md) for reproduction and classification. This plan does not re-verify or close reports.

| Finding | Effect on plan / next action |
| --- | --- |
| BUG-001 overlong signup username message | Functional regression awaits fix and fresh exploration; remaining signup tests continue. |
| BUG-002 blank product update | Suspected functional issue; clarify field requirements before asserting expected behavior. |
| BUG-003 DELETE error body | Documentation/contract gap: existing 404 status coverage does not establish ErrorDto compliance. Review intended body and retain verified runtime assertions with bug reference. |
| BUG-004 empty product description | Resolve schema vs intended acceptance; do not count unsupported empty-description behavior as covered. |
| BUG-005 QR errors as PNG | Current tests assert error body/status; media-type assertion intentionally deferred in current spec. Track that gap separately from 400/401 breadth. |
| BUG-006 cart errors as CartDto; BUG-007 missing stock 409 | Current specs DO include 400/401 and stock 409, with bug comments. Earlier exploration exclusions are superseded by the final follow-up. Documentation fixes do not block these tests. |
| BUG-008 referenced product DELETE 500 | Blocks a passing referenced-product deletion regression, not unrelated product/cart/orders work. Preserve cart-before-product cleanup; confirm desired cascade/conflict behavior before regression. |
| Product GET collection and POST documented 404 | No dedicated 404 assertion. Identify intended trigger in source/live contract; do not empty shared data or break infrastructure to inflate coverage. |
| Signup workflow and cleanup | The test named “can authenticate immediately” asserts only 201 and empty body; standalone signup cases create users without teardown. Treat authentication and cleanup as unimplemented depth work, not covered from the title. |

## Scenario and completion rules

Before automation, save a focused assessment and scenario table, then explore through the configured gateway with terminal HTTP calls. For each scenario record method/path, role, exact setup, input, expectation source, status/body/state assertions, distinct integration risk, lower-level evidence, actual outcome, bug and cleanup. Example for B:

**Given:** a disposable signed-in customer with an unused refresh token.

**When:** exchange that refresh token once, call me with the new access token, and replay the old refresh token.

**Then:** rotation returns 200 and a replacement refresh token, me returns the same customer, and replay returns 401. Confirm current response schema in exploration before implementation.

Unit/component tests should own boundary/null/format permutations and pure business rules; database integration tests should own locking, transactions and race matrices. Deployed API checks retain route/auth/error mapping, representative validation, state persistence, ownership and cross-service workflows. Each additional case needs a distinct integration risk.

An operation is ready for handover when exploration evidence exists, intended behavior is verified, dedicated specs use clients initialized in `test.beforeEach`, cases use given/when/then with blank separation and status ordering, representative applicable 400/401 exist, affected specs and relevant API suite pass, teardown is verified, and unresolved behaviors have explicit bug/gap links. Functional defects are not passing expectations, skips or expected failures. “Has tests” remains distinct from “handover complete.”

## Maintaining the plan after every test change

1. Review target assertions, including helpers/validators and parameterized values. Add/update the operation entry in `coverage-map.json` with its spec, unique target response statuses and the SHA-256 of the reviewed spec (`shasum -a 256 <spec>`). Never copy setup/cleanup statuses into the entry. Update `reviewedOn`. Hashes detect edits, not correctness; helper changes still require semantic review.
2. Run `npm run coverage:api`, then `npm run coverage:api:check`. The check fails for stale generated Markdown, changed mapped specs, removed operations or new unmapped specs. New OpenAPI operations automatically enlarge the denominator. Review spec-to-operation mapping manually; the script does not infer HTTP behavior from TypeScript.
3. Run the affected specs and `npm run test:api` after automation work. Record date, gateway, contract/source/deployed revision, command, passed/failed/skipped counts, evidence location and cleanup. A failed/skipped test does not remove implemented breadth; report run health separately and keep the affected risk open.
4. Update package progress, remaining gaps, blockers and next action here in the same change. Reconcile doc-only bug comments and contract changes. Add a history row; do not claim a new baseline execution from discovery alone.
5. Reviewers run the coverage check. Future CI should run the same check alongside API tests; this change adds local commands and repository maintenance instructions, not a scheduled monitor or CI job.

| Date | Change / execution | Breadth | Next action |
| --- | --- | --- | --- |
| 2026-09-08 | Initial reviewed inventory; `npx playwright test tests/api --list`: 88 tests / 13 specs. No runtime tests in planning task. | 13/55 (23.6%) | Start B: assess refresh/logout/me, explore disposable-user lifecycle, then automate; run A triage and C/D assessment in parallel if contributors are available. |
