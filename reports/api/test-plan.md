# API test plan and status

## Status at a glance

**Updated: 2026-09-09 · Overall: In progress — current suite verification pending.**

This is a manually maintained snapshot for GitLab readers. It reflects recorded evidence, not live pipeline status. Coverage was last reviewed on 2026-09-08; this update adds reporting structure, with no new test execution.

| Question | Current status |
| --- | --- |
| What has been implemented? | Dedicated tests for **35/55 API operations (63.6%)**, across the nine areas below. This measures implemented coverage, not passing tests or complete behavior coverage. |
| What has been verified? | The previous full run recorded **130 passed, 0 failed, 0 skipped** on 2026-09-08 against the local gateway. It predates the expanded suite; see [execution evidence](#execution-evidence). |
| What is not done? | **20 operations** still lack dedicated tests: password/email, MFA, SSO, Ollama and traffic. Existing areas also have [behavior gaps](#gaps-in-covered-areas). |
| What needs attention? | Known functional findings include product deletion returning 500 and reopening orders without deducting stock. See [risks and dependencies](#risks-and-dependencies). |
| What happens next? | Verify the expanded suite and record its result, address P0 gaps, then start package F — password & email. |

## Execution evidence

Keep execution results separate from implemented coverage. A passing historical run does not establish the health of the current suite.

| Scope | Execution date | Environment | Result | Evidence / limitation |
| --- | --- | --- | --- | --- |
| Previous full API suite, before expansion | 2026-09-08 | Local gateway | 130 passed, 0 failed, 0 skipped | Carried forward from the previous plan. Exact command, tested revision and run artifact were not linked; this result excludes the new packages. |
| Current expanded API suite | Not recorded | Not recorded | Verification pending | No completed result recorded in this plan. Next verification: `npm run test:api`; record revision, environment, counts and a GitLab-accessible report or job link. |

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

## To do

**Immediate next action:** verify the expanded suite and update execution evidence above. **Next new scope: F — password & email.** Address existing gaps (A) alongside new endpoint coverage. Packages F–K below are not yet automated; their prerequisites still need verification.

| Priority | Package | Scope | Main checks / dependency |
| --- | --- | --- | --- |
| P0 | A — existing gaps | Already covered endpoints | Signup → signin and user cleanup; bug regressions; missing product 404 cases |
| P1 | F — password & email | 6 operations | Reset lifecycle, token revocation, delivery events, outbox; verify test mail sink and isolated outbox |
| P1 | H — MFA | 6 operations | Enrollment, signin, recovery codes, disable; disposable user and TOTP |
| P2 | I — SSO | 1 operation | Exchange, provisioning, invalid tokens; controlled OIDC issuer |
| P2 | J — Ollama | 4 operations | Definitions, streaming, history/tools, errors; model or mock |
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
| Contracts | Error schemas/media types and undocumented conflicts; QR error media checks deferred | [Bug index](../bugs/README.md): BUG-003, 005–007, 010, 012 |

Functional regressions wait for a fix and fresh exploration. Documentation-only issues do not block tests of verified intended behavior.

## Risks and dependencies

| Item | Impact on progress | Next action |
| --- | --- | --- |
| Current suite result missing | Implemented coverage cannot yet be reported as verified. | Run the expanded API suite and publish its actual result, including failures and cleanup issues. |
| [Referenced-product deletion](../bugs/[M][F]-BUG-008-product-delete-referenced-by-cart.md) and [order reopening](../bugs/[H][F]-BUG-009-order-reopening-inventory.md) | Known 500 response and stock-consistency defect remain unresolved in the bug index. | Fix, explore the corrected behavior and add passing regressions. |
| Suspected findings and unclear requirements | Some expected behaviors still need confirmation; affected gaps remain open. | Clarify and reproduce the findings linked above; update their bug reports. |
| Mail sink/outbox, OIDC issuer and model/mock availability | Prerequisites for F, I and J are not yet confirmed; these are dependencies, not established blockers. | Verify isolation and availability during package assessment. |

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

Reassessed all bug reports from recorded impact; see [the severity review](../bugs/severity-review-2026-09-09.md). Three account API specs changed only in bug-link comments; reviewed those path-only differences and refreshed their hashes. Endpoint/status breadth and executable assertions are unchanged. No live requests or API suite were run for this documentation task. `npm run coverage:api` and `npm run coverage:api:check` passed: 35/55 operations, unchanged.
