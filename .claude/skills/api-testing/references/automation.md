# Lean Playwright API automation

## Select coverage from exploration

Before writing new automated tests, complete the source-first and curl workflow
in [exploration](exploration.md). Map each documented response code to a
representative, runtime-verified scenario. Use one representative 400 case per
endpoint; detailed field validation belongs in backend unit tests.

Cover meaningful successful state transitions and authorization/ownership rules
without multiplying equivalent cases. If a documented response cannot be reached,
record the gap and investigate the contract rather than fabricating a test.
Follow the [shared automation rules](../../shared/testing.md) for known defects
and future regressions.

## Follow the repository structure

- REST: one spec file per HTTP method + path in `tests/api/`, grouped by resource
  (GraphQL uses domain-grouped files; see [GraphQL](graphql.md)).
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

## Keep tests short

Prefer short tests. Move repeated setup into fixtures and repeated groups of
assertions or reads into named helpers, so each test shows its scenario and
business outcome at a glance.

## Assert behavior and preserve independence

Assert the exact expected status, meaningful body/schema fields and relevant
headers. For mutations verify persisted state and related side effects; for
rejected mutations verify that state remains unchanged where relevant. Compute
expected values from test-owned inputs, not from the response under test.

Apply the shared ownership and cleanup rules through the existing API context,
which deletes owned users before products to remove cart/order references.

## Verify and repair

Use the repository's declared Node.js version and installed dependencies.

1. Run `npx tsc --noEmit` and the affected spec(s), for example
   `npx playwright test tests/api/products/create-product.api.spec.ts`.
2. Repair test/client/fixture problems within scope. When a failure exposes an
   application defect, reproduce it with curl and report it; keep the read-only
   backend unchanged and follow the shared verification rules.
3. Run `npm run test:api` when shared clients, types, fixtures, or broader API
   behavior changed. Otherwise keep verification focused.
4. Complete the cleanup, diff review and result reporting from the shared rules.
