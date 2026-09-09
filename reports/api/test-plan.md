# API test plan and status

Scope: HTTP API operations and response contracts. Screen and browser-journey coverage is maintained in the separate [UI test plan](../ui/test-plan.md).

## Status at a glance

**Updated: 2026-09-09 · Overall: In progress — current suite verified; uncovered operations remain.**

This is a manually maintained snapshot for GitLab readers. It reflects recorded evidence, not live pipeline status. Ollama target assertions and stream/schema validators were reviewed on 2026-09-09; four operations were added.

| Question | Current status |
| --- | --- |
| What has been implemented? | Dedicated tests for **39/55 API operations (70.9%)**, across the ten areas below. This measures implemented coverage, not passing tests or complete behavior coverage. |
| What has been verified? | The current full run recorded **202 passed, 0 failed, 0 skipped** on 2026-09-09 against the local gateway; see [execution evidence](#execution-evidence). |
| What is not done? | **16 operations** still lack dedicated tests: password/email, MFA, SSO and traffic. Existing areas also have [behavior gaps](#gaps-in-covered-areas). |
| What needs attention? | Known functional findings include product deletion returning 500 and reopening orders without deducting stock. See [risks and dependencies](#risks-and-dependencies). |
| What happens next? | Address P0 gaps, then start package F — password & email. |

## Execution evidence

Keep execution results separate from implemented coverage. A passing historical run does not establish the health of the current suite.

| Scope | Execution date | Environment | Result | Evidence / limitation |
| --- | --- | --- | --- | --- |
| Previous full API suite, before expansion | 2026-09-08 | Local gateway | 130 passed, 0 failed, 0 skipped | Carried forward from the previous plan. Exact command, tested revision and run artifact were not linked; this result excludes the new packages. |
| Resource factory refactor, full API suite | 2026-09-09 | http://localhost:8081 | **182 passed, 0 failed, 0 skipped**, 14.9s | `npm run test:api -- tests/api/product tests/api/orders tests/api/accounts tests/api/cart tests/api/inventory` selected the full suite because the script already includes `tests/api/`. [Local log](../exploration/resource-factories/api-focused.log), ignored/workspace-only; no CI job link. Deployed revision unknown. |
| Ollama expansion, full API suite | 2026-09-09 | http://localhost:8081 | **202 passed, 0 failed, 0 skipped**, 16.6s | `npm run test:api`; tracked [verification record](../ollama-verification.md), local detailed logs; no CI job link. |

## Implemented coverage

“Implemented” means dedicated endpoint assertions exist in the [reviewed inventory](coverage.md). It does not mean an area is complete or has passed current verification.

| Area | Operations | Covered behavior |
| --- | --- | --- |
| Signin / signup | 2/2 | Success, validation, authentication errors, duplicates |
| Sessions (B) | 3/3 | Refresh rotation/replay, logout revocation, current identity |
| Products | 5/5 | CRUD, validation, roles, persistence |
| Cart | 5/5 | Ownership, totals, mutations, stock-conflict rollback |
| Orders (C) | 6/6 | Checkout, reads/lists, pagination/filtering, ownership, cancellation/status, inventory effects |
| QR | 1/1 | PNG response, validation, anonymous access rejection |
| Inventory (D) | 4/4 | List/detail, adjustments, replay/conflict rollback, movements, validation, roles |
| Accounts (E) | 5/5 | List/profile/edit/delete, ownership, validation; cascade checks under review |
| Prompts (G) | 4/4 | Defaults, update/readback, validation, customer isolation |
| Ollama (J) | 4/4 | Deterministic generate/chat streams, thinking, real catalog tool output, definitions, validation and authentication |

## To do

**Immediate next action:** address the remaining P0 gaps. **Next new scope: F — password & email.** Address existing gaps (A) alongside new endpoint coverage. Packages F, H, I and K remain unautomated; package J is verified for the selected mock scenarios.

| Priority | Package | Scope | Main checks / dependency |
| --- | --- | --- | --- |
| P0 | A — existing gaps | Already covered endpoints | Signup → signin and user cleanup; bug regressions; missing product 404 cases |
| P1 | F — password & email | 6 operations | Reset lifecycle, token revocation, delivery events, outbox; verify test mail sink and isolated outbox |
| P1 | H — MFA | 6 operations | Enrollment, signin, recovery codes, disable; disposable user and TOTP |
| P2 | I — SSO | 1 operation | Exchange, provisioning, invalid tokens; controlled OIDC issuer |
| P2 | J — Ollama | Verified · 4/4 operations, 20 tests | Complete deterministic responses, thinking, catalog tool output, schemas and 400/401. History BUG-049 and fault/multi-step gaps remain; see [verification](../ollama-verification.md). |
| P2 | K — traffic | 3 operations | Info, list/detail, filtering, correlation, redaction; verify access rules |

For each package: assess → explore → automate → verify. Include applicable validation, authentication, permissions and state changes. Exact endpoints and missing statuses: [coverage inventory](coverage.md).

## Gaps in covered areas

| Area | Remaining work | Reports |
| --- | --- | --- |
| Signup | Verify immediate signin; clean up created users; fix username validation message | [BUG-001](../bugs/[L][F]-BUG-001-signup-overlong-username-validation.md) |
| Products | Clarify blank fields/description; referenced-product deletion; missing collection/create 404 cases | [BUG-002](../bugs/[M][F]-BUG-002-product-update-blank-fields.md), [BUG-004](../bugs/[M][D]-BUG-004-product-description-contract.md), [BUG-008](../bugs/[M][F]-BUG-008-product-delete-referenced-by-cart.md) |
| Orders | Reopening and inventory consistency; invalid status returns 401; mutation timestamp discrepancy | [BUG-009](../bugs/[H][F]-BUG-009-order-reopening-inventory.md), [BUG-011](../bugs/[M][F]-BUG-011-order-invalid-status-unauthorized.md), [BUG-013](../bugs/[L][F]-BUG-013-order-mutation-stale-updated-at.md) |
| Inventory | Malformed adjustment UUID returns 401; missing-product regressions and concurrent adjustment idempotency remain gaps | [BUG-014](../bugs/[M][F]-BUG-014-inventory-malformed-request-id-401.md) |
| Accounts | Stale deleted-user token causes cart 500; email-event cascade remains covered at backend level | [BUG-022](../bugs/[L][F]-BUG-022-cart-read-after-account-deletion-500.md) |
| Ollama | Follow-up selection BUG-049; interrupted streams, upstream 404/500 and owned multi-step tools remain uncovered | [Verification record](../ollama-verification.md) |
| Contracts | Error schemas/media types and undocumented conflicts; QR error media checks deferred | [Bug index](../bugs/README.md): BUG-003, 005–007, 010, 012 |

Functional regressions wait for a fix and fresh exploration. Documentation-only issues do not block tests of verified intended behavior.

## Risks and dependencies

| Item | Impact on progress | Next action |
| --- | --- | --- |
| Local verification only | Current full suite passed; no CI job link is available. | Publish a reproducible CI run when available; retain local execution limits. |
| [Referenced-product deletion](../bugs/[M][F]-BUG-008-product-delete-referenced-by-cart.md) and [order reopening](../bugs/[H][F]-BUG-009-order-reopening-inventory.md) | Known 500 response and stock-consistency defect remain unresolved in the bug index. | Fix, explore the corrected behavior and add passing regressions. |
| Suspected findings and unclear requirements | Some expected behaviors still need confirmation; affected gaps remain open. | Clarify and reproduce the findings linked above; update their bug reports. |
| Mail sink/outbox, OIDC issuer and model/mock availability | Prerequisites for F and I are not yet confirmed; J uses the verified deterministic mock; these are dependencies, not established blockers. | Verify isolation and availability during package assessment. |

## Reports

- [Coverage inventory](coverage.md) — endpoints, specs, covered/missing statuses.
- [Bug index](../bugs/README.md) — findings, reproduction and status.

## Keeping this plan current

- After each completed work package or verification run, update the snapshot date, overall status, coverage, gaps and next action. Do not refresh the coverage review date without a review.
- Use explicit states: not started, in progress, implemented / verification pending, verified, or blocked (with a reason and next action). Mark a scope verified only with execution evidence; retain any known gaps.
- Keep the latest execution summary here: date, tested commit, command, environment, passed/failed/skipped counts, cleanup outcome and a GitLab-accessible report or CI job link. Preserve the previous result when a new run is pending or blocked. Put detailed logs in linked reports; local or ignored artifacts alone are not evidence accessible to GitLab readers.
- Review target assertions and helpers; refresh [coverage mapping](coverage-map.json) statuses, spec hashes and review date.
- Run `npm run coverage:api`, `npm run coverage:api:check`, affected tests and the API suite after test changes. Record actual results separately from coverage.
- Follow [API testing workflow](../../.agents/skills/api-testing/SKILL.md) for assessment, exploration and safe cleanup.

## Bug tagging migration — 2026-09-09

Bug filenames now include severity and primary category; IDs and existing severity rationales are preserved. Updated report links in 23 API spec comments and verified the affected specs differ only in those paths. Refreshed their reviewed hashes without changing target assertions, statuses or endpoint breadth. Five hashes were already stale before migration (user-get, user-delete, user-forget and both prompt PUT specs); reviewed their target assertions and relevant validators before refreshing them. Coverage generation and consistency checks passed. This documentation migration involved no fresh exploratory or suite execution; the execution status above is unchanged.

## Severity reassessment — 2026-09-09

Reassessed all bug reports from recorded impact; see [the bug index](../bugs/README.md). Three account API specs changed only in bug-link comments; reviewed those path-only differences and refreshed their hashes. Endpoint/status breadth and executable assertions are unchanged. No live requests or API suite were run for this documentation task. `npm run coverage:api` and `npm run coverage:api:check` passed: 35/55 operations, unchanged.

## Resource factory review — 2026-09-09

Shared `productFactory` owns product creation/tracking/deletion; `accountFactory` owns disposable customers and removes cart/order references before product teardown. API product read/update/delete and account-forget setup now use typed factories. Create-product targets, including negative cases, remain raw client requests and track returned IDs before assertions. Reviewed affected target assertions and shared cart/order/inventory/prompt setup semantics: no asserted endpoint/status removed or added. Refreshed spec hashes after this review. Signup/login setup validates success and records ownership before validation. Existing representative 400/401 coverage is preserved.

Exploration verified create/read/cart/checkout and user-before-product cleanup. Existing account tests retain explicit cascade assertions; setup cleanup calls do not count as endpoint coverage. [Local exploration](../exploration/resource-factories/plan.md) is ignored/workspace-only. Backend source inspected at `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed alignment and backend test execution are not established. This refactor introduces no new endpoint cases.

The pre-existing stale hash for `orders-admin.api.spec.ts` was also reconciled after reviewing its pagination/owner-membership and 400/401/403 target assertions; its code and status mapping are unchanged.

### Factory directory extraction

Moved product/account lifecycle implementations and order setup into `factories/productFactory.ts`, `factories/accountFactory.ts` and `factories/orderFactory.ts`. Fixtures retain test scope, lazy composition and account-before-product cleanup. Reviewed the moved methods: HTTP calls, payload generation, assertions and cleanup statuses are unchanged. No specs or coverage mappings changed in this extraction. `npm run test:api`: **182 passed**, 0 failed/skipped, 16.5s; [local log](../exploration/resource-factories/api-directory.log). Coverage generation/check passed with unchanged breadth.
