# Write readable API tests

Read `AGENTS.md` for required structure, lifecycle, test ordering and execution. Inspect neighboring specs and clients before implementing; use them as context, not as a reason to repeat awkward code.

## Place responsibilities deliberately

- `tests/api/<domain>/`: scenarios, the tested action, and meaningful outcomes. Describe the actor, business condition and result in English, for example “should reject stock underflow without recording a movement - 409”. Keep method/path in the surrounding describe block for traceability.
- `clients/<domain>/`: endpoint URL, HTTP method, headers and serialization, using `test-config.ts`. Expose named operations such as `adjust` or `cancel`; preserve access to response status, headers and body for negative and contract checks. Do not assert success inside a client that must also exercise errors.
- `fixtures/`: reusable account/product state, authentication and reliable teardown. Follow existing fixture dependencies and track disposable resources as soon as they are created.
- `generators/` and `types/`: payload construction and request/response models. Keep scenario-specific values visible in the test; place small parameter tables immediately above the relevant group. Use `tests/api/test-data/` for genuinely shared cases.
- `validators/`: focused reusable response or domain assertions, with useful failure messages. Extract complex decoding, polling, state comparison or multi-request setup into cohesive supporting files. Keep new TypeScript directories included in `tsconfig.json` if needed.

## Keep the scenario visible

Use given/when/then to show preparation, the operation being tested, and assertions. Aim for a short readable scenario, without a fixed line limit. Extract distracting mechanics, not the business distinction that makes the case meaningful. Prefer `expectStockUnchanged` over vague helpers such as `checkResponse`; use actual project abstractions or add the smallest necessary one.

Keep transport details out of specs where clients can own them. Direct Playwright assertions remain appropriate when they clearly express the outcome. Avoid a generic workflow framework, deep helper chains, or hiding the tested action in setup. Multi-call behavior such as refresh rotation may need more than one action; retain its causal sequence.

Assert status and meaningful content, persisted effects, or absence of mutation as appropriate. Check setup/read responses before trusting their bodies. For access control, distinguish unauthenticated callers, forbidden roles and other owners; prove protected state survives rejected mutations. A valid PNG does not prove correct QR content, and a TypeScript type does not validate a runtime response.

Automate stable behavior and representative validation cases. Keep exhaustive length, null/presence and Unicode matrices at the backend validation/service layer. Do not encode a confirmed defect as correct behavior or add expected-failure regressions for unresolved defects to the passing suite. Keep proposed regressions in reports until the requirement and fix are agreed. Registration tests should focus on registration without a subsequent login. Avoid exact dynamic tokens, timestamps and map ordering.

## Isolation and timing

Use unique disposable accounts, products and session IDs, with deterministic stock and prices. Never mutate shared demo accounts or fixtures. Reuse the existing cleanup dependency order: remove account-owned dependent orders before products, and assert cleanup responses even after test failure. Do not clear a global outbox used by other tests.

Use bounded polling for asynchronous observations rather than arbitrary sleeps or global record counts. Local password-reset token exposure is an explicit test-profile prerequisite; do not silently substitute it for delivery verification. SSO, MFA and model-backed endpoints need their own available prerequisites. Record untested branches honestly.
