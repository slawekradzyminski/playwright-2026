# API test plan

**Last verified: 2026-09-11.** [API Testing skill](../.codex/skills/api-testing/SKILL.md) · [Contract](exploratory-testing/openapi-2026-09-11-8081.json) · [Tests](../tests/api) · [Bug register](bugs/README.md) · [Historical management report](api-coverage-report.html)

## Coverage and last execution

**44/55 operations (80.0%); 11 remaining.** An operation is one HTTP method + path with a dedicated active spec. Fixture/helper calls do not count. This measures endpoint breadth, not exhaustive scenarios or schema conformance.

Last run: `npm run test:api` — **234 passed, 0 failed, 0 skipped (22.4s)** at `http://localhost:8081`, backend image `slawekradzyminski/backend:3.7.16`, Ollama mock `1.0.9`. TypeScript passed with `--noEmit --noUnusedLocals --noUnusedParameters`. Retained the gateway's September 11 OpenAPI; deployed source revisions are unverified. Port 4001 is a separate environment and excluded.

| Area | Covered / total | Coverage | Active tests | Automated now | Still to automate |
|---|---:|---:|---:|---|---|
| Users | 16/24 | 66.7% | 66 | Sign-up/sign-in; refresh/logout; GET list, me, username; GET/PUT both prompts; profile PUT; both account DELETE routes; forgot/reset password | Six MFA operations; SSO exchange; dedicated email-events spec |
| Products | 5/5 | 100% | 38 | List, detail, create, update, delete | Deeper scenarios below |
| Cart | 5/5 | 100% | 21 | GET/DELETE cart; POST items; PUT/DELETE item | Deeper scenarios below |
| Orders | 6/6 | 100% | 34 | Create, list own/all, detail, status update, cancel | Deeper scenarios below |
| Inventory | 4/4 | 100% | 26 | List, detail, movements, adjustment | Stock concurrency; overflow; order-linked movement history |
| Ollama | 4/4 | 100% | 24 | Incremental SSE, exact mock text, thinking, stateless follow-up, one/two tool calls and real snapshot, definitions, 400/401 | Upstream faults, disconnects, iteration limit; marker semantics (BUG-12) |
| Email / local outbox / QR | 1/4 | 25% | 5 | Create QR | Send email; GET/DELETE outbox; delivery flow |
| Traffic | 3/3 | 100% | 20 | Info, filtered/paginated log list, correlation lookup | Successful time-range boundaries; legacy-public mode; retention/redaction depth; WebSocket behavior |
| **Total** | **44/55** | **80.0%** | **234** | **44 dedicated endpoint specs** | **11 operations** |

## Next priorities and prerequisites

1. Retest agreed defects against the deployed build, especially QR Unicode encoding and Medium findings. Add regressions after correction; retain unresolved behavior and proposed cases in the [bug register](bugs/README.md).
2. Cover six MFA operations and SSO (7 operations): disposable enrollment/challenge/recovery fixtures and a configured OIDC test provider.
3. Cover dedicated user email-events, send email and GET/DELETE outbox (4 operations): deterministic delivery timing and isolated outbox data. Do not clear a shared global outbox.
4. Extend Ollama depth with isolated upstream fault scenarios (404/429/500, truncated stream) and agree tool completion-marker semantics before adding regressions.

## Important limits

- Known findings remain in the register; passing tests do not resolve them. Missing-credential validation and order reopening policy need clarification.
- Recovery tests depend on explicit local reset-token exposure and check email events; actual delivery and expiry remain uncovered.
- Ollama tests require the delayed deterministic mock and seeded product 1; fixed prose verifies transport, not model quality. Unknown model names succeed in this mock. DOC-15 records contract gaps; BUG-12 covers intermediate completion markers.
- QR tests verify PNG structure, not decoded content. Unicode corruption remains open (BUG-11).
- Further depth: throttling, expiry/refresh races, stock concurrency, multi-product rollback, monetary precision, full transitions/erasure, inventory overflow and order-linked movements, traffic time ranges/retention/redaction and legacy-public mode.

Maintain this as a current snapshot using the skill's [plan guidance](../.codex/skills/api-testing/references/test-plan.md). Keep detailed evidence in bug reports and preserve dated contract snapshots. The management report is historical and maintained separately.
