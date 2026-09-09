# Test resources and scenarios

Use the test-scoped factories wired by `resources.fixture.ts` for disposable API setup in both API and UI tests. The existing `products`, `accounts`, `loggedInUser` and `loggedInAdmin` fixture files re-export the same base for established imports. Fixtures remain lazy: importing this base does not create users, products or browser contexts.

Factory implementations live in [factories/](../factories/README.md), split into `productFactory.ts`, `accountFactory.ts` and `orderFactory.ts`. Fixtures instantiate them and control teardown. Generators build payloads in memory; factories persist resources through HTTP.

## Ownership rule

Every disposable resource has one cleanup owner. A scenario fixture describes the data it needs; it does not implement another product/account deletion loop.

- `productFactory.create(overrides)` creates and validates a setup product, registers its ID before validation, and returns `ProductDto`. Overrides are typed as `Partial<ProductCreateDto>`.
- `productFactory.track(id)` registers a product created by the tested API/UI action. Call it as soon as the response exposes an ID, before assertions, including unexpected creation in negative cases. Track only resources owned by this test.
- `accountFactory.create()` creates a disposable authenticated customer. Ownership is registered before signup/login validation, allowing cleanup when setup fails.
- `accountFactory.track(username)` registers an account owned by the current test; never register the shared administrator or an existing unrelated account.
- `loggedInUser` creates one account through `accountFactory`. `loggedInAdmin` and `adminToken` share one test-scoped admin login. Tests must not log out or mutate the shared administrator's account.

`accountFactory` depends on `productFactory`, so account deletion removes cart/order references before products are deleted. Creating the factory itself creates no products. Both teardown loops attempt every owned resource and surface all failures. Already-deleted resources (404) are accepted. Cart and order scenarios rely on the verified account-deletion cascade; direct cascade assertions remain in API account tests.

## Setup versus tested actions

Use typed factories in `given`; keep the endpoint client or page object action explicit in `when`. Factories validate successful setup. HTTP clients continue to accept malformed payloads and return raw responses for negative and contract tests.

```ts
test('200 - update stock', async ({ productFactory, adminToken }) => {
  // given
  const product = await productFactory.create({ stockQuantity: 2 });

  // when
  const response = await client.updateProduct(product.id, { stockQuantity: 5 }, adminToken);

  // then
  const updated = await expectJson(response, 200);
  expect(updated.stockQuantity).toBe(5);
});
```

For create-endpoint tests, call `client.createProduct` directly and register the returned ID with `productFactory.track`. For UI product creation, keep the form interaction and response synchronization in the test/page object, then track the resulting ID. Initialize the endpoint client or page object under test in `test.beforeEach`.

## Order scenarios

- `orderIdentities.get('owner' | 'other')` lazily creates and caches only the requested identity for the test.
- `orderProducts` creates the two products used by the standard order scenario.
- `orderSetup` composes both identities and products, with `fillCart` and `createOrder` helpers. Request it when the test actually needs that complete scenario.
- `ordersUi.fixture.ts` selects browser authentication with `orderIdentity`. It does not depend on `orderSetup` or `orderProducts`. Missing-order/admin-navigation cases therefore need no products; a customer missing-order case creates only its selected customer.

Use the UI fixture's browser-safe `missingOrderId` for a genuine missing-order response. The direct API fixture retains its signed 64-bit boundary ID; see [BUG-047](../reports/bugs/[L][F]-BUG-047-order-route-rounds-large-identifiers.md).
