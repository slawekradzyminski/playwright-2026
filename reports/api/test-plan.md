# API coverage plan

**Covered: 22/55 operations (40%) · Remaining: 33**

Latest API run: **130 passed, 0 failed/skipped** — 2026-09-08, local gateway.

Coverage means dedicated endpoint tests, not complete behavior coverage. Known gaps are listed below.

## Covered

| Area | Operations | Covered behavior |
| --- | --- | --- |
| Signin / signup | 2/2 | Success, validation, authentication errors, duplicates |
| Sessions (B) | 3/3 | Refresh rotation/replay, logout revocation, current identity |
| Products | 5/5 | CRUD, validation, roles, persistence |
| Cart | 5/5 | Ownership, totals, mutations, stock-conflict rollback |
| Orders (C) | 6/6 | Checkout, reads/lists, pagination/filtering, ownership, cancellation/status, inventory effects |
| QR | 1/1 | PNG response, validation, anonymous access rejection |

## To do

**Next: D — inventory.** Address existing gaps (A) alongside new endpoint coverage.

| Priority | Package | Scope | Main checks / dependency |
| --- | --- | --- | --- |
| P0 | A — existing gaps | Already covered endpoints | Signup → signin and user cleanup; bug regressions; missing product 404 cases |
| P0 | D — inventory | 4 operations | List/detail, adjustments, movements, idempotency, roles; disposable products |
| P1 | E — accounts | 5 operations | List/profile/edit/delete, ownership, deletion cascade; owned cart/order/email data |
| P1 | F — password & email | 6 operations | Reset lifecycle, token revocation, delivery events, outbox; verify test mail sink and isolated outbox |
| P1 | G — prompts | 4 operations | Defaults, write/readback, validation, customer isolation |
| P1 | H — MFA | 6 operations | Enrollment, signin, recovery codes, disable; disposable user and TOTP |
| P2 | I — SSO | 1 operation | Exchange, provisioning, invalid tokens; controlled OIDC issuer |
| P2 | J — Ollama | 4 operations | Definitions, streaming, history/tools, errors; model or mock |
| P2 | K — traffic | 3 operations | Info, list/detail, filtering, correlation, redaction; verify access rules |

For each package: assess → explore → automate → verify. Include applicable validation, authentication, permissions and state changes. Exact endpoints and missing statuses: [coverage inventory](coverage.md).

## Gaps in covered areas

| Area | Remaining work | Reports |
| --- | --- | --- |
| Signup | Verify immediate signin; clean up created users; fix username validation message | [BUG-001](../bugs/BUG-001-signup-overlong-username-validation.md) |
| Products | Clarify blank fields/description; referenced-product deletion; missing collection/create 404 cases | [BUG-002](../bugs/BUG-002-product-update-blank-fields.md), [BUG-004](../bugs/BUG-004-product-description-contract.md), [BUG-008](../bugs/BUG-008-product-delete-referenced-by-cart.md) |
| Orders | Reopening and inventory consistency; invalid status returns 401; mutation timestamp discrepancy | [BUG-009](../bugs/BUG-009-order-reopening-inventory.md), [BUG-011](../bugs/BUG-011-order-invalid-status-unauthorized.md), [BUG-013](../bugs/BUG-013-order-mutation-stale-updated-at.md) |
| Contracts | Error schemas/media types and undocumented conflicts; QR error media checks deferred | [Bug index](../bugs/README.md): BUG-003, 005–007, 010, 012 |

Functional regressions wait for a fix and fresh exploration. Documentation-only issues do not block tests of verified intended behavior.

## Reports

- [Coverage inventory](coverage.md) — endpoints, specs, covered/missing statuses.
- [Bug index](../bugs/README.md) — findings, reproduction and status.
- [Execution history](execution-history.md) — previous runs and results.

## Keeping this plan current

- Update current coverage, package status, gaps and next action; keep entries short.
- Put execution details in reports, not a running diary here.
- Review target assertions and helpers; refresh [coverage mapping](coverage-map.json) statuses, spec hashes and review date.
- Run `npm run coverage:api`, `npm run coverage:api:check`, affected tests and the API suite after test changes. Record actual results separately from coverage.
- Follow [API testing workflow](../../.agents/skills/api-testing/SKILL.md) for assessment, exploration and safe cleanup.
