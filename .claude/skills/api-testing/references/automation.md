# Lean Playwright API automation

## Select coverage from exploration

Before writing new automated tests, complete the source-first and curl workflow
in [exploration](exploration.md). Map each documented response code to a
representative, runtime-verified scenario. Use one representative 400 case per
endpoint; detailed field validation belongs in backend unit tests.

Cover meaningful successful state transitions and authorization/ownership rules
without multiplying equivalent cases. If a documented response cannot be reached,
record the gap and investigate the contract rather than fabricating a test.
Do not assert a known defect as correct behavior or add tests expected to fail
because of it. Link the bug and leave its regression test in the fix's acceptance
criteria. Do not use skips or expected failures to disguise that gap.

## Follow the repository structure

- One spec file per HTTP method + path in `tests/api/`, grouped by resource.
  GET and DELETE of the same path belong in separate files. Name the describe
  block with the method and path; order tests by response code ascending.
- Use `// given` for setup, `// when` for the tested action, `// then` for
  assertions. Keep requests and transport details in `http/` clients; keep DTO
  types in `types/`. Extend existing abstractions only as the scenario needs.
- Each test creates its own users with `generators/user-generator.ts` and
  products with `generators/product-generator.ts`. Do not depend on seeded
  resource IDs, test order, or data created by another test.
- Reuse `tests/api/fixtures.ts` and `tests/api/support/api-test-context.ts` for
  test-scoped setup and cleanup. For carts, inspect
  `tests/api/cart/cart-test-context.ts`. Read the current helpers before using
  them; avoid duplicating resource tracking or creating a parallel framework.

For a concrete existing example, read
`tests/api/products/create-product.api.spec.ts` and its client/assertion helpers.

## Assert behavior and preserve independence

Assert the exact expected status, meaningful body/schema fields and relevant
headers. For mutations verify persisted state and related side effects; for
rejected mutations verify that state remains unchanged where relevant. Compute
expected values from test-owned inputs, not from the response under test.

Track successful creates before assertions that could fail, including unexpected
successes of negative tests. Use fixture teardown/finally so cleanup still runs
after a failure. The existing API context deletes owned users before products
to remove cart/order references. Keep authentication state test-scoped; use the
configured administrator only for operations requiring it. Never hard-code
credentials or mutate/delete pre-existing shared resources.

## Verify and repair

Use the repository's declared Node.js version and installed dependencies.

1. Run `npx tsc --noEmit` and the affected spec(s), for example
   `npx playwright test tests/api/products/create-product.api.spec.ts`.
2. Repair test/client/fixture problems within scope. When a failure exposes an
   application defect, reproduce it with curl and report it; keep the read-only
   backend unchanged and do not weaken assertions or add retries to hide it.
3. Run `npm run test:api` when shared clients, types, fixtures, or broader API
   behavior changed. Otherwise keep verification focused; reuse passing evidence
   for unchanged artifacts.
4. Check cleanup results and the final diff for leaked data, credentials, debug
   artifacts, and unrelated edits. Report actual commands and results, including
   blocked checks. A collection-only or type check is not a runtime test pass.
