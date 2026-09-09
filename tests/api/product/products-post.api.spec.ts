import { expectJson } from '../../../validators/jsonResponse';
import { test, expect } from '../../../fixtures/products.fixture';
import { expectProductMatchesPayload, expectPersistedProduct } from '../../../validators/productResponse';
import { ProductClient } from '../../../http/productClient';
import { generateProduct } from '../../../generators/productGenerator';
import { invalidProductCases, validProductCases, unauthorizedCases } from './product-cases';

let client: ProductClient;
test.beforeEach(({ request }) => { client = new ProductClient(request); });

for (const { label, overrides } of validProductCases) {
  test(`201 - create product with ${label}`, async ({ adminToken, productFactory }) => {
    // given
    const payload = generateProduct(overrides);

    // when
    const response = await client.createProduct(payload, adminToken);
    const product = await response.json();
    if (product.id) productFactory.track(product.id);

    // then
    expect(response.status()).toBe(201);
    expectProductMatchesPayload(product, payload);
    const persisted = await client.getProductById(product.id, adminToken);
    await expectPersistedProduct(persisted, product);
  });
}

// One required-field error and one domain validation error are sufficient here.
const invalidCases = [
  { label: 'missing name', field: 'name', value: undefined },
  ...invalidProductCases
];
for (const { label, field, value } of invalidCases) {
  test(`400 - reject ${label}`, async ({ adminToken, productFactory }) => {
    // given
    const payload = { ...generateProduct(), [field]: value };

    // when
    const response = await client.createProduct(payload, adminToken);
    const body = await response.json();
    if (body.id) productFactory.track(body.id);

    // then
    expect(response.status()).toBe(400);
    expect(body[field]).toEqual(expect.any(String));
  });
}
for (const { label, token, message } of unauthorizedCases) {
  test(`401 - reject ${label}`, async ({ adminToken, productFactory }) => {
    // given
    const payload = generateProduct();

    // when
    const response = await client.createProduct(payload, token);
    const body = await response.json();
    if (body.id) productFactory.track(body.id);

    // then
    expect(response.status()).toBe(401);
    expect(body).toEqual({ message });
    const catalog = await client.getAllProducts(adminToken);
    expect(await expectJson(catalog, 200)).not.toEqual(expect.arrayContaining([expect.objectContaining({ name: payload.name })]));
  });
}
test('403 - customer cannot create a product', async ({ loggedInUser, adminToken, productFactory }) => {
  // given
  const payload = generateProduct();

  // when
  const response = await client.createProduct(payload, loggedInUser.token);
  const body = await response.json();
  if (body.id) productFactory.track(body.id);

  // then
  expect(response.status()).toBe(403);
  expect(body).toEqual({ message: 'Access denied' });
  const catalog = await client.getAllProducts(adminToken);
  expect(await expectJson(catalog, 200)).not.toEqual(expect.arrayContaining([expect.objectContaining({ name: payload.name })]));
});
