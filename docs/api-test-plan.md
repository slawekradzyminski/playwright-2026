# API test plan

**Baseline: 2026-09-10.** Reference: [API Docs JSON snapshot](exploratory-testing/openapi-2026-09-10.json); [live JSON](http://localhost:8081/v3/api-docs). Sources: [API tests](../tests/api), [bug register](bugs/README.md).

**Endpoint coverage: 16/55 = 29.1%; 39 operations remain.** Count one HTTP method + path as one operation, covered only when a dedicated active spec asserts its behavior. Fixture/cleanup calls do not count: user DELETE has a client but no dedicated spec. This measures breadth, not complete scenario or contract coverage. Baseline run: `npm run test:api` — **80 passed (5.7s)**.

| Area | Covered / total | Automated now | Still to automate |
|---|---:|---|---|
| Users | 11/24 | Sign-up/sign-in; refresh/logout; GET list, me, username; GET/PUT both system prompts | Profile PUT; both account DELETE routes; six MFA operations; SSO exchange; forgot/reset password; email events |
| Products | 5/5 | List, detail, create, update, delete | Deeper scenarios below |
| Cart | 0/5 | — | GET/DELETE cart; POST items; PUT/DELETE item |
| Orders | 0/6 | — | Create, list own/all, detail, status update, cancel |
| Inventory | 0/4 | — | List, detail, movements, adjustment |
| Ollama | 0/4 | — | Generate, chat, tool chat, tool definitions |
| Email / local outbox / QR | 0/4 | — | Send email; GET/DELETE outbox; create QR |
| Traffic | 0/3 | — | Info; log list; correlation lookup |

**Existing scenario coverage:** successful responses and meaningful body checks; representative validation/authentication errors; duplicate registration; refresh rotation/reuse and logout revocation; prompt persistence/reset/length; product admin/client permissions, rejected mutations, invalid/missing IDs. Coverage varies by operation; 5/5 products does not mean every documented response is tested.

**Priority work and parallel ownership** — proposed workstreams, not required test execution order:

| Stream | Next work | Dependencies / coordination |
|---|---|---|
| A — Commerce | Cart → order creation → reads/cancel/status; inventory in parallel after product setup | Reuse account/product fixtures. Own products per test; verify stock effects, empty-cart rejection, cross-user access, status transitions and adjustment idempotency. Agree cart/order setup and cleanup first. |
| B — Accounts & security | Profile/update/delete permissions; password reset; MFA; then SSO | Reset: forgot → captured email/token → reset → login/session checks. MFA: setup → confirm → sign-in challenge → second factor; then recovery/disable. SSO needs a configured OIDC test provider. |
| C — Utilities & integrations | Email/outbox/events, QR, traffic, Ollama | Can start alongside A/B. Provide isolated email capture for B; Ollama needs an available model/service. Check response behavior without asserting exact generated prose. |
| D — Defect follow-up | Clarify expectations, retest fixes, add agreed regressions | Can run alongside A–C; coordinate shared validators with their owners. Prioritize BUG-04/06 and DOC-02/07/09; resolve BUG-02 before encoding a requirement. |

**Dependency rules:** signup → signin supplies authenticated fixtures; admin signin supplies product setup and account cleanup. Order creation consumes and clears the caller's cart. Never share mutable accounts, carts, products or refresh tokens across workers. Reset, MFA disable and logout revoke refresh tokens; use dedicated accounts. Serialize global outbox clearing and shared rate-limit tests. Account deletion removes dependent data: verify deletion effects before cleanup; establish order/product cleanup during exploration rather than assuming products with orders can be deleted safely.

**Remaining depth / decisions:** expiry and refresh races; cross-account isolation; rate limits; stock concurrency and monetary precision; malformed/type/null boundaries. Clarify user-directory visibility, coercion/nonblank rules and product POST/PUT differences. [Recorded findings](bugs/README.md): **16 Open + 1 Needs clarification**; a green suite does not close them. Contract defects also prevent treating current JSON as an unquestioned schema oracle.

**Working agreement:** explore each new operation first using the [existing workflow](exploratory-testing/README.md). Then add one client and one spec per operation, initialize clients in `beforeEach`, use given/when/then and ascending status codes. Keep detailed boundary matrices at the backend layer. Finish each batch with passing `npm run test:api`, verified cleanup and updated coverage/bug status. Recount method/path operations against a new dated JSON snapshot when the API changes; keep this baseline intact. First breadth milestone: cart + orders + inventory adds 15 operations → **31/55 (56.4%)**, assuming an unchanged contract.
