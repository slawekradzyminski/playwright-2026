# API test plan

**Current status: 2026-09-10.** [Management report — unchanged for this batch](api-coverage-report.html) · [API contract snapshot](exploratory-testing/openapi-2026-09-10.json) · [API tests](../tests/api) · [Bug register](bugs/README.md)

## Coverage and execution

**40/55 operations covered — 72.7%; 15 remain.** One operation is one HTTP method + path from the retained contract. Count it only when a dedicated active spec asserts its behavior. Fixture, cleanup and helper calls do not count: user email events are exercised during password recovery but have no dedicated spec. Coverage measures endpoint breadth, not exhaustive scenarios or schema conformance.

**Independently verified on 2026-09-10:** `npm run test:api` — **210 passed, 0 failed, 0 skipped (16.6s)** against `http://localhost:8081`, backend image `slawekradzyminski/backend:3.7.16`. TypeScript also passed with `--noEmit --noUnusedLocals --noUnusedParameters`. The live OpenAPI matches the retained snapshot structurally. The deployed source revision is unverified; newer annotations in the local source are not proof that the running contract is fixed.

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

## Covered scenarios

- **Existing users:** registration/authentication responses, representative validation failures, duplicate registration, refresh rotation/reuse, logout revocation, prompt persistence/reset and length boundaries.
- **Profile and deletion:** owner/admin profile changes persist; injected role/password fields do not elevate privileges or replace the password; response secret fields are absent. Rejected updates preserve stored data. Ordinary DELETE is admin-only; right-to-be-forgotten allows owner/admin. Tests verify account lookup returns 404 after deletion, refresh sessions are revoked, and pending reset tokens stop working after right-to-be-forgotten. A forbidden cross-account request checks that the target survives. Complete erasure of orders, carts, email records and MFA state is not claimed by these checks.
- **Password recovery:** username/email requests, generic unknown-account message, request email event, captured local token → reset → old-password rejection → new-password login. Two existing refresh sessions for the target are revoked while another account's session survives. Invalid and reused tokens cannot change the password; mismatched confirmation leaves a valid token usable. The suite explicitly requires the local profile's `password-reset.expose-token-in-response` feature. It does not silently fall back from an email-delivery check or claim account-enumeration resistance. Actual outbox delivery and token expiry remain separate work.
- **Products:** admin/client permissions, CRUD responses, rejected mutations, invalid/missing IDs and representative boundaries.
- **Cart and orders:** client/admin permissions, representative cross-account isolation, quantity/stock boundaries, checkout stock revalidation, address validation, totals, cart clearing, stock consumption/restoration, pagination/filtering, forward status changes, cancellation restrictions and authentication failures.
- **Inventory:** disposable stock-5 products with unique names, catalog/stock filters, pagination, default/custom stock classification, initial and adjustment movements, newest-first movement pagination, stock reflected in both inventory and product reads, positive/negative adjustments, zero-stock boundary, idempotent replay, conflicting requestId rejection, underflow rejection without mutations, invalid input/missing products and admin-only access.
- **QR:** ASCII and multiline ASCII generation, PNG media type/signature/IHDR dimensions/IEND, blank/missing text and authentication failures. Native decoding independently verified ASCII fidelity and exposed Unicode corruption (BUG-11). The portable API tests check image structure; they do not provide decoder coverage or approve the corrupted Unicode branch.
- **Traffic:** admin/client access with unique session headers, scoped filtering and pagination, nonmatching filters, size clamping, invalid page/time/session inputs, authentication failures, correlation equality with a captured log, unknown IDs and different-session 404 responses. Bounded polling waits for capture. Tests avoid global log counts and do not infer per-user secrecy from session-header scoping.

| Access boundary | Operations |
|---|---|
| Authenticated caller | User reads/prompts; QR; own cart/order operations; traffic with a valid session header in this profile |
| Owner or admin | Profile PUT; right-to-be-forgotten; order detail/cancellation subject to status |
| Admin only | Ordinary user DELETE; product mutations; inventory; GET all orders; PUT order status |
| Public local recovery | Forgot/reset password without an access token; token capture is explicitly local/testing functionality |

## Findings and decisions

[Current register](bugs/README.md): **25 findings — 23 Open, 2 Needs clarification; 11 functional API, 14 documentation; 7 Medium, 18 Low** (including two provisional Low). No High impact is demonstrated. Findings were assessed by impact and evidence; passing tests do not resolve them.

| Finding or suspicion | Supervisor assessment / disposition |
|---|---|
| BUG-11: Unicode QR content | Confirmed independently by decoding two fresh images: `żółć 🌍` becomes `?ó?? ?`. Medium functional defect. Fix encoding and add decoder-based regressions; do not equate a valid PNG with correct content. |
| BUG-06 and DOC-02/07/09/12 | Password byte-limit failure and successful-response type contradictions remain supported by evidence. Medium concerns with no demonstrated production outage. DOC-07 also covers the unknown-account recovery response's undocumented null token. |
| BUG-04: empty email | Historical reproductions remain Open/Medium. Fresh attempts hit an existing duplicate empty email, so this session neither reconfirmed acceptance nor established a fix. Do not modify an unrelated account to free the value. |
| BUG-02 and BUG-10 | Remain Needs clarification/provisional Low. Missing-credential feedback and reopening/reservation policy require agreed requirements; no authentication bypass or overselling was established. |
| BUG-01/03/05/07/08/09 | Representative failures were reproduced. Impact remains Low: misleading guidance or an opaque rejection. Referenced-product deletion may legitimately be restricted; returning an unexplained 500 is the confirmed issue. |
| Inventory 409 and traffic clamping | Inventory underflow/conflicting replay correctly reject mutation; omitted 409 documentation belongs to DOC-12. The suspected traffic page-size bug was disproved by independent probes. Neither is filed as a new functional failure. |
| Error/schema documentation | DOC-06 extends related user mutation/recovery errors; DOC-13 covers QR JSON errors advertised as PNG; DOC-14 covers traffic profile requirements and error/empty-body responses. Existing error-contract findings remain Low. |

Runtime parsing of an oversized inventory delta also returned 401 twice; related evidence is attached to BUG-01 without inventing a separate root cause or adding another finding. Numeric QR coercion, directory visibility and nonblank/coercion policies remain questions. No production token-leakage claim follows from explicitly enabled local reset-token exposure.

## Next work

| Priority | Scope | Dependencies / completion target |
|---|---|---|
| 1 | Correct QR payload encoding and agreed Medium defects | Reproduce against the deployed build; add exact decoded-payload regressions after correction. Retest schema fixes against a newly captured contract. Keep unresolved defects out of the passing suite as expected-failure or defective-behavior assertions. |
| 2 | Remaining account security: six MFA endpoints and SSO | Disposable MFA enrollment → confirm → challenge → second factor → recovery/disable fixtures. SSO requires a configured OIDC test provider. This adds seven operations. |
| 3 | Email/outbox/events: four operations | Dedicated user email-events spec; send email; GET/DELETE local outbox. Define deterministic delivery timing and protected-outbox configuration. Never clear the global outbox while parallel reset tests or other users depend on it. |
| 4 | Ollama: four operations | Available model/service and stable request/response checks without exact generated prose. |
| Ongoing | Scenario depth and defect follow-up | Expiry/refresh races, throttling, stock concurrency, multi-product atomic rollback, monetary precision, full order transitions, order-linked movement records, full erasure effects, malformed/type/null/overflow boundaries, QR decoding and traffic retention/redaction/time-range behavior. |

These seven account, four email and four Ollama operations account for all **15 remaining endpoints**. Clarify policy-dependent behavior before encoding it as a requirement.

## Execution and maintenance

All four delegated workstreams performed live discovery before automation using the [exploratory workflow](exploratory-testing/README.md). Four subagents were requested with Luna routing; the session allowed three concurrent children, so discovery was staggered and tracked-file writing was serialized. The supervisor independently reviewed semantic changes, corrected weak assertions and fixture risks, reassessed reported bugs, and ran the final checks. No conflicts required a merge; no monetary saving was measured.

Use one client and dedicated spec per operation; initialize test clients in `beforeEach`, use given/when/then and order tests by ascending response status. Keep deterministic stock/price, unique products/accounts/session IDs and lazy cleanup fixtures. Signup/signin supplies disposable users; admin credentials provide setup and cleanup. Never mutate a shared admin/client account or shared commerce fixture. Delete owners and dependent orders before products and assert cleanup responses. The final 210-test run includes those fixture cleanup checks.

Password-recovery API tests capture the explicitly exposed local response token and verify the request email event. Outbox delivery is asynchronous; a short empty-outbox probe is not proof of a broken mail flow or a disabled sink. The local source schedules delayed delivery, but deployed timing was not exhaustively established. A separate delivery test needs a controlled delay or appropriate time budget.

Finish each batch with `npm run test:api`, type checking, cleanup checks, a method/path coverage recount, current finding dispositions and a reviewed diff. If the deployed API changes, retain the old evidence snapshot and capture a new one. **The management report was deliberately left unchanged at the user's request.** Update this plan coherently; do not append historical coverage totals.
