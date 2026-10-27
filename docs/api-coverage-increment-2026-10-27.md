# API exploration and verification evidence — 2026-10-27

This document records this task's evidence. The generic endpoint inventory is
maintained separately in API-TEST-PLAN.md.

## Environment and workflow

Three Luna agents independently performed source analysis, live-contract/curl
exploration, triage, implementation, focused verification and cleanup for
Orders, Users and Traffic. The supervisor reviewed their completed work,
extended boundary probes, consolidated findings, refactored the tests and ran
integrated verification. The project-local api-testing skill and all three
references were read before API work.

- Gateway from project configuration: `http://localhost:8081`.
- Node: 24.22.1. Backend container: `awesome-light-backend-1`, image 3.9.4.
- Observed profile: `SPRING_PROFILES_ACTIVE=local`.
- OCI image revision: `fd4c015434dd573f26bf8ff6691ff14611e2f247`.
- Read-only reference checkout: `3152f6cc331940c6d89eb6eff8e4b5a7b820079e`.
  Matching runtime checkout inspected; diff contains only compose/security
  README changes, no Java source changes.
- Live `/v3/api-docs`, fetched with bounded curl after source analysis,
  reconciles to 55 REST operations under `/api/v1`.
- Sandbox localhost access initially failed; approved local execution reached
  the configured gateway. No alternate environment or internal service port used.

## Explicit automated coverage

Paths below include the `/api/v1` prefix. Codes list representative scenarios,
not a claim of exhaustive field or business-state coverage.

| Method and route | Automated response codes |
| --- | --- |
| POST /orders | 201, 400, 401, 409 |
| GET /orders | 200, 400, 401 |
| GET /orders/{id} | 200 (owner/admin), 401, 404 (foreign owner) |
| PUT /orders/{id}/status | 200, 400 (already cancelled), 401, 403, 404 |
| POST /orders/{id}/cancel | 200, 400 (repeated), 401, 403, 404 |
| GET /orders/admin | 200, 400, 401, 403 |
| GET /users | 200 (admin), 401 |
| GET /users/{username} | 200, 401, 404 |
| GET /users/me | 200, 401 |
| PUT /users/{username} | 200, 400, 401, 403, 404 (admin) |
| DELETE /users/{username} | 204, 401, 403, 404 (admin) |
| GET /traffic/info | 200, 400, 401 |
| GET /traffic/logs | 200, 400, 401 |
| GET /traffic/logs/{correlationId} | 200, 400, 401, 404 |

Final increment: 54 tests (Orders 27, Users 16, Traffic 11), covering 14
additional explicit endpoints. Total endpoint presence: 31/55.

## Runtime observations and triage

| Probe | Actual result | Disposition |
| --- | --- | --- |
| Checkout quantity 2 from stock 9 | 201 PENDING; cart cleared; stock 7; persisted address/items/prices | Automated |
| Cancellation and repeated cancellation | 200 CANCELLED and stock restored; repeat 400 without second restoration | Automated as separate scenarios |
| Admin SHIPPED status / cancellation | Status persists; cancellation of SHIPPED returns 400 | Status automated; SHIPPED cancellation explored only |
| Checkout with stock reduced below cart quantity | 409; cart and stock unchanged, no order created | Automated |
| Other user's order | Detail 404; cancellation 403; owned order unchanged | Automated |
| Address fields null/empty/whitespace | 400 field errors for each of street/city/state/zip/country | Representative invalid postal code automated |
| Address street/city/state/country lengths 255 and 256 | Each 255 returned 201; each 256 returned 500; rejected checkout retained cart/stock | New [BUG-0013](../bugs/functional/BUG-0013-order-address-lengths-exceed-storage-limits.md); no known-failing regression added |
| Object-valued city, literal null status, unknown enum status | 400 with Spring default body, rather than documented DTO | Extended BUG-0006 and documentation BUG-0008 |
| Profile valid edits | 200, GET me confirms fields | Automated |
| Missing/null/empty email, malformed email, short name | 400; null names leave existing values unchanged | Malformed email automated |
| Profile first/last names 255/256, four spaces | 255 succeeds; 256 reports a minimum-length message; spaces persist | Extended BUG-0003 |
| Numeric first/last names 1234 | 200; GET me returns string "1234" | Extended BUG-0005 |
| Profile duplicate email of another owned account | 500 Internal server error | Reconfirmed BUG-0006 |
| Client directory read | 200; conflicts with backend README's ADMIN-only claim, while OpenAPI allows authenticated callers | BUG-0008 documentation row; Q16 policy decision. Success test uses admin |
| Traffic session lengths 16/128 vs 15/129; trimming | Boundaries accepted; adjacent invalid lengths rejected; whitespace trimmed | Representative missing session automated |
| Traffic size 0 / 200 | Clamped to 1 / 100 | Explored; no global count assumptions |
| Traffic method/status/path/text/time filters | Combined filters succeed; invalid from/to return 400 | Representative invalid time automated |
| Traffic list/detail with distinct sessions | Own record visible; foreign session detail 404 empty; list contains only chosen session | Automated with unique sessions/correlation IDs |
| Traffic 400 body `{error: string}` | Compatible with ValidationErrorsDto's documented string-map format | Rejected initial mismatch suspicion; no bug report |
| Authorization header in own captured traffic | Unmasked under explicitly disabled local obfuscation | Q14 configuration decision |
| Second disposable account, same chosen traffic session | Reads first account's record with 200 | Q15 session/principal access decision |
| Delete account with pending order | User DELETE 204, order then 404 even to admin, stock remains deducted | Q8 upgraded from code-only to runtime-confirmed observation |
| Reopen cancelled order using admin status update | PENDING assigned, restored stock unchanged; subsequent cancellation does not add stock again | Q17 commerce decision; direct assignment is documented |

New BUG-0013 was allocated centrally after checking both bug folders; no other
new bug number was allocated. Existing root causes were extended rather than
reported again. Decisions are in [QUESTIONS.md](../bugs/QUESTIONS.md). No backend
code or protection switches were modified.

## Quality review and refactoring

- Added a test-scoped OrderTestContext, using the existing ApiTestContext for
  resource ownership/cleanup. Cart creation, checkout and persisted stock/order
  checks no longer repeat in every test. Products come from the generator.
- Added typed order assertions with totals derived from owned inputs.
- Added a test-scoped TrafficTestContext and typed traffic assertions. Responses
  are projected before assertions so failure output excludes captured credentials
  and bodies. Bounded polling waits only for owned asynchronous traffic capture.
- Shared fixtures initialize contexts/clients per test, with lazy admin login
  cached only within the ApiTestContext. No mutable worker-global clients or tokens.
- Removed direct transport calls from order specs and replaced the known-defect
  malformed-status assertion with a valid business-rejection scenario.
- Removed fixed user names from missing-user mutations. Role-denied order writes
  target owned resources and verify unchanged state. Admin list assertions do
  not assume a particular order is on the first page or an exact global total.
- Split repeated cancellation and the two traffic 404 cases into focused tests;
  ordered cases by status code; checked meaningful response bodies and persistence.

## Verification and cleanup

- Agent focused runs: Orders 20 passed; Users 16 passed; Traffic 10 passed.
  Earlier type checks saw unfinished sibling files; they were not final failures.
- After integration/refactoring: `npx tsc --noEmit` passed.
- Focused integrated run: `npx playwright test tests/api/orders tests/api/users tests/api/traffic --output=/tmp/integrated-api-increment-results` — 54 passed.
- Final broad run: `npm run test:api -- --output=/tmp/api-increment-final-results` — 122 passed, 0 failed (10.0 seconds, 9 workers, no retries).
- `npm run skills:sync` and `npm run skills:check` passed after the requested generic-plan skill change.
- `git diff --check` passed.

All fixture-managed accounts/products were removed by teardown; cleanup status
assertions passed. Agent curl cleanup returned 204 for owned resources.
Supervisor follow-ups created three disposable users and two products in total;
all five cleanup DELETE requests returned 204. User deletion cascaded their cart
and order references before product deletion. Traffic telemetry remains under
service retention because no scoped delete endpoint exists; no global reset or
shared-data deletion was performed.

Sanitized detailed area matrices and supervisor JSON observations are available
locally in ignored `artifacts/api-increment-2026-10-27/`. No credentials/tokens
are included in this tracked evidence document or bug reports.

## Limits

POST orders' documented 404 requires a cart product to disappear; referential
protection prevents a stable ordinary setup. GET order's path-conversion 400,
unreadable JSON/status bodies and confirmed validation/storage defects were
not automated as accepted behavior. Fix acceptance criteria require regressions.
The source-derived supervisor probes include address lengths and profile
coercion/duplicate email, but this is not exhaustive fuzzing or concurrency
verification. Alternate profiles, inventory APIs, and the remaining user/auth
operations are outside this increment. Traffic credential masking, session-to-
principal binding, directory access and order-deletion/reactivation policy remain
unresolved decisions, not silently asserted product requirements.
