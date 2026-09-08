import { test, expect } from '../../../fixtures/products.fixture';
import { expectUpdatedProduct, expectPersistedProduct } from '../../../validators/productResponse';
import { ProductClient } from '../../../http/productClient';
import { generateProduct } from '../../../generators/productGenerator';
import type { ProductDto } from '../../../types/product';
import { invalidProductCases, validProductCases, INVALID_PRODUCT_ID, unauthorizedCases } from './product-cases';

let client: ProductClient;
test.beforeEach(({ request }) => { client = new ProductClient(request); });

let product: ProductDto;
test.beforeEach(async ({ adminToken, productIds }) => {
  const response = await client.createProduct(generateProduct(), adminToken);
  product = await response.json();
  if (product.id) productIds.add(product.id);
  expect(response.status()).toBe(201);
});

async function expectUnchanged(token: string) {
  const response = await client.getProductById(product.id, token);
  await expectPersistedProduct(response, product);
}

for (const { label, overrides } of validProductCases) {
  test(`200 - update ${label}`, async ({ adminToken }) => {
    // given
    const payload = generateProduct(overrides);

    // when
    const response = await client.updateProduct(product.id, payload, adminToken);

    // then
    expect(response.status()).toBe(200);
    const updated = await response.json();
    expectUpdatedProduct(updated, product, payload);
    const persisted = await client.getProductById(product.id, adminToken);
    await expectPersistedProduct(persisted, updated);
  });
}
for (const payload of [{ price: 0.01 }, { stockQuantity: 0 }, {}, { name: null }]) {
  test(`200 - partial update ${JSON.stringify(payload)}`, async ({ adminToken }) => {
    // given
    const original = product;

    // when
    const response = await client.updateProduct(product.id, payload, adminToken);

    // then
    expect(response.status()).toBe(200);
    const updated = await response.json();
    expectUpdatedProduct(updated, original, payload);
    const persisted = await client.getProductById(product.id, adminToken);
    await expectPersistedProduct(persisted, updated);
  });
}
for (const { label, field, value } of invalidProductCases) {
  test(`400 - reject ${label}`, async ({ adminToken }) => {
    // given
    const payload = { [field]: value };

    // when
    const response = await client.updateProduct(product.id, payload, adminToken);

    // then
    expect(response.status()).toBe(400);
    expect((await response.json())[field]).toEqual(expect.any(String));
    await expectUnchanged(adminToken);
  });
}

test('400 - reject malformed product ID', async ({ adminToken }) => {
  // given
  const invalidId = INVALID_PRODUCT_ID;

  // when
  const response = await client.updateProduct(invalidId, generateProduct(), adminToken);

  // then
  expect(response.status()).toBe(400);
  await expectUnchanged(adminToken);
});
for (const { label, token, message } of unauthorizedCases) {
  test(`401 - reject ${label}`, async ({ adminToken }) => {
    // given
    const id = product.id;

    // when
    const response = await client.updateProduct(id, generateProduct(), token);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message });
    await expectUnchanged(adminToken);
  });
}
test('403 - reject customer mutation', async ({ loggedInUser, adminToken }) => {
  // given
  const id = product.id;

  // when
  const response = await client.updateProduct(id, generateProduct(), loggedInUser.token);

  // then
  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({ message: 'Access denied' });
  await expectUnchanged(adminToken);
});

test(`404 - unknown ID`, async ({ adminToken }) => {
  // given
  const unknownId = 999999999;

  // when
  const response = await client.updateProduct(unknownId, generateProduct(), adminToken);

  // then
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({ message: 'Product not found' });
  await expectUnchanged(adminToken);
});

test('404 - already deleted product', async ({ adminToken }) => {
  // given
  expect((await client.deleteProduct(product.id, adminToken)).status()).toBe(204);

  // when
  const response = await client.updateProduct(product.id, generateProduct(), adminToken);

  // then
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({ message: 'Product not found' });
});
