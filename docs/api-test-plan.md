# API test plan

**Current status: 2026-09-10.** [Management report](api-coverage-report.html) · [API contract snapshot](exploratory-testing/openapi-2026-09-10.json) · [API tests](../tests/api) · [Bug register](bugs/README.md)

## Coverage and execution

**27/55 operations covered — 49.1%; 28 remain.** One operation is one HTTP method + path from the dated contract snapshot. Count it only when a dedicated active spec asserts its behavior. Fixture and cleanup calls do not count; user DELETE has a client but no dedicated spec. Coverage measures endpoint breadth, not exhaustive scenarios or contract conformance.

**Verified on 2026-09-10:** `npm run test:api` — **135 passed, 0 failed, 0 skipped (14.6s)** against the configured local stack. A passing suite does not close recorded findings or establish release readiness. These figures describe the current snapshot, not a historical comparison or a measured daily increase.

| Area | Covered / total | Coverage | Automated now | Still to automate |
|---|---:|---:|---|---|
| Users | 11/24 | 45.8% | Sign-up/sign-in; refresh/logout; GET list, me, username; GET/PUT both system prompts | Profile PUT; both account DELETE routes; six MFA operations; SSO exchange; forgot/reset password; email events |
| Products | 5/5 | 100% | List, detail, create, update, delete | Deeper scenarios below |
| Cart | 5/5 | 100% | GET/DELETE cart; POST items; PUT/DELETE item | Deeper scenarios below |
| Orders | 6/6 | 100% | Create, list own/all, detail, status update, cancel | Deeper scenarios below |
| Inventory | 0/4 | 0% | — | List, detail, movements, adjustment |
| Ollama | 0/4 | 0% | — | Generate, chat, tool chat, tool definitions |
| Email / local outbox / QR | 0/4 | 0% | — | Send email; GET/DELETE outbox; create QR |
| Traffic | 0/3 | 0% | — | Info; log list; correlation lookup |
| **Total** | **27/55** | **49.1%** | **27 dedicated endpoint specs** | **28 operations** |

## Covered scenarios

- **Users:** successful responses and body checks; representative validation/authentication failures; duplicate registration; refresh rotation/reuse and logout revocation; prompt persistence, reset and length boundaries.
- **Products:** admin/client permissions, CRUD responses, rejected mutations, invalid/missing IDs and representative input boundaries.
- **Cart and orders:** client/admin permissions, cross-account isolation, zero/negative/at-stock/above-stock quantities, cumulative additions, checkout stock revalidation, address validation, empty-cart rejection, totals, cart clearing, stock consumption/restoration, pagination/filtering, forward status changes, cancellation restrictions and authentication failures.

| Commerce access | Operations |
|---|---|
| Authenticated caller | GET/DELETE cart; POST items; PUT/DELETE item; POST orders; GET own orders |
| Owner or admin | GET order detail; POST cancellation, subject to status |
| Admin only | GET all orders `/orders/admin`; PUT order status |

## Findings and decisions

[Current register](bugs/README.md): **21 findings — 19 Open, 2 Needs clarification; 10 functional API, 11 documentation; 5 Medium, 16 Low** (including two provisional Low). No High-severity impact is demonstrated in the recorded evidence. Passing automation does not resolve these findings.

Prioritize BUG-04/06 and DOC-02/07/09. Resolve missing-credential requirements (BUG-02) and reopening/backward order-transition policy (BUG-10) before encoding them as approved behavior. Commerce findings also cover undocumented stock conflicts, invalid status parsing returning 401 and referenced-product deletion returning 500. Contract defects prevent treating the snapshot as an unquestioned schema oracle.

## Next work

| Priority | Scope | Dependencies / completion target |
|---|---|---|
| 1 | Inventory: all four operations | Isolated product fixtures; verify stock effects, movement records and adjustment idempotency after exploration. Completes breadth coverage of commerce including inventory: **31/55 = 56.4%** overall. |
| 2 | Accounts and security: 13 remaining operations | Profile/update/delete permissions; forgot → captured token → reset → login/session checks; MFA setup → confirm → challenge → second factor → recovery/disable. SSO requires a configured OIDC test provider. |
| 3 | Utilities and integrations: 11 operations | Email/outbox/events coordination for account tests; QR and traffic; available Ollama model/service. Assert response behavior without exact generated prose. User email events are counted under Users, not twice. |
| Ongoing | Defect follow-up and scenario depth | Retest fixes, add agreed regressions; expiry/refresh races, throttling, stock concurrency, multi-product atomic rollback, monetary precision, full order transitions, malformed/type/null/overflow boundaries and price-change policy. |

Clarify user-directory visibility, coercion/nonblank rules and product POST/PUT differences. Existing cross-account checks are representative, not an exhaustive authorization matrix.

## Execution and maintenance

Explore each new operation first using the [exploratory workflow](exploratory-testing/README.md). Add one endpoint client and one dedicated spec per operation; initialize clients in `beforeEach`, use given/when/then and order tests by ascending status code. Keep detailed boundary matrices at the backend layer.

Signup/signin supplies authenticated fixtures; admin signin supplies product setup and account cleanup. Use deterministic stock/price and disposable accounts/products. Never share mutable accounts, carts, products or refresh tokens across workers, or mutate a shared admin cart. Checkout consumes stock and clears the caller's cart; reset, MFA disable and logout revoke refresh tokens. Serialize global outbox clearing and shared rate-limit tests. Delete owners and dependent orders before products, assert cleanup responses and verify deletion effects before cleanup.

Finish each batch with passing `npm run test:api`, verified cleanup and current coverage/finding counts. When the API changes, capture a new dated contract and recount method/path operations. Maintain this document as one coherent current version, and regenerate the management report from it; do not append historical status updates.
