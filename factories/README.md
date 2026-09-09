# Factories

Factories create disposable backend resources for test setup. Playwright fixtures instantiate them per test and control their lifetime.

- [ProductFactory](productFactory.ts): creates products, tracks products created by tested actions, and deletes owned products.
- [AccountFactory](accountFactory.ts): creates authenticated customers, tracks owned usernames, and deletes accounts with their cart/order references.
- [OrderFactory](orderFactory.ts): fills a customer's cart and creates the standard two-product order scenario. Its orders belong to accounts managed by AccountFactory, which owns their cascade cleanup.

Keep fixture dependencies and `try/finally` teardown in `fixtures/`. In particular, account cleanup must finish before product cleanup. Keep tested HTTP requests in specs and endpoint clients; factories are for successful setup.

## Generators versus factories

These layers have different jobs:

| Layer | Responsibility | Side effects |
| --- | --- | --- |
| `generators/` | Build request data in memory, with optional overrides | Random data generation only; no HTTP calls or cleanup |
| `factories/` | Use that data to create backend resources and track ownership | HTTP calls; cleanup for owned resources |
| `fixtures/` | Provide test-scoped factory instances and compose scenarios | Control setup order and teardown |

`generateProduct({ stockQuantity: 2 })` returns a payload and creates nothing in the application. `productFactory.create({ stockQuantity: 2 })` uses the generator, posts the payload, validates the response and registers the product for cleanup.

For a create-product test, generate the payload in `given`, call the HTTP client in `when`, then track any returned ID before asserting the response. For an update/delete/UI test, create its prerequisite product through the factory in `given`. This preserves direct negative testing and avoids calling the operation under test during setup by accident.

Generators remain useful and should not be merged into factories. Avoid adding a second copy of their default payloads inside factories. Explicit scenario values, such as catalog prices and stock levels, belong in the scenario's overrides.

See [fixture usage](../fixtures/README.md) for ownership rules and examples.
