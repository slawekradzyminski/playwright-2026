# API test plan

**Last verified: 2026-09-10.** [API Testing skill](../.agents/skills/api-testing/SKILL.md) · [Contract](exploratory-testing/openapi-2026-09-10.json) · [Tests](../tests/api) · [Bug register](bugs/README.md) · [Historical management report](api-coverage-report.html)

## Coverage and last execution

**40/55 operations (72.7%); 15 remaining.** An operation is one HTTP method + path with a dedicated active spec. Fixture/helper calls do not count. This measures endpoint breadth, not exhaustive scenarios or schema conformance.

Last recorded run: `npm run test:api` — **210 passed, 0 failed, 0 skipped (16.6s)** at `http://localhost:8081`, image `slawekradzyminski/backend:3.7.16`. TypeScript passed with `--noEmit --noUnusedLocals --noUnusedParameters`. Live OpenAPI matched the retained snapshot; deployed source revision was unverified. These are historical results, not a new verification.

| Area | Covered / total | Coverage | Active tests | Automated now | Still to automate |
|---|---:|---:|---:|---|---|
| Users | 16/24 | 66.7% | 66 | Sign-up/sign-in; refresh/logout; GET list, me, username; GET/PUT both prompts; profile PUT; both account DELETE routes; forgot/reset password | Six MFA operations; SSO exchange; dedicated email-events spec |
| Products | 5/5 | 100% | 38 | List, detail, create, update, delete | Deeper scenarios below |
| Cart | 5/5 | 100% | 21 | GET/DELETE cart; POST items; PUT/DELETE item | Deeper scenarios below |
| Orders | 6/6 | 100% | 34 | Create, list own/all, detail, status update, cancel | Deeper scenarios below |
| Inventory | 4/4 | 100% | 26 | List, detail, movements, adjustment | Stock concurrency; overflow; order-linked movement history |
| Ollama | 0/4 | 0% | 0 | — | Generate, chat, tool chat, tool definitions |
| Email / local outbox / QR | 1/4 | 25% | 5 | Create QR | Send email; GET/DELETE outbox; delivery flow |
| Traffic | 3/3 | 100% | 20 | Info, filtered/paginated log list, correlation lookup | Successful time-range boundaries; legacy-public mode; retention/redaction depth; WebSocket behavior |
| **Total** | **40/55** | **72.7%** | **210** | **40 dedicated endpoint specs** | **15 operations** |

## Next priorities and prerequisites

1. Retest agreed defects against the deployed build, especially QR Unicode encoding and Medium findings. Add regressions after correction; retain unresolved behavior and proposed cases in the [bug register](bugs/README.md).
2. Cover six MFA operations and SSO (7 operations): disposable enrollment/challenge/recovery fixtures and a configured OIDC test provider.
3. Cover dedicated user email-events, send email and GET/DELETE outbox (4 operations): deterministic delivery timing and isolated outbox data. Do not clear a shared global outbox.
4. Cover Ollama (4 operations): available model/service and stable assertions without exact generated prose.

## Important limits

- Known findings remain in the register; passing tests do not resolve them. Missing-credential validation and order reopening policy need clarification.
- Recovery tests depend on explicit local reset-token exposure and check email events; actual delivery and expiry remain uncovered.
- QR tests verify PNG structure, not decoded content. Unicode corruption remains open (BUG-11).
- Further depth: throttling, expiry/refresh races, stock concurrency, multi-product rollback, monetary precision, full transitions/erasure, inventory overflow and order-linked movements, traffic time ranges/retention/redaction and legacy-public mode.

Maintain this as a current snapshot using the skill's [plan guidance](../.agents/skills/api-testing/references/test-plan.md). Keep detailed evidence in bug reports and preserve dated contract snapshots. The management report is historical and maintained separately.
