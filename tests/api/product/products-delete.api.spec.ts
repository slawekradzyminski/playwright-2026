import { expectJson } from '../../../validators/jsonResponse';
import { test, expect } from '../../../fixtures/products.fixture';
import { ProductClient } from '../../../http/productClient';
import type { ProductDto } from '../../../types/product';
import { INVALID_PRODUCT_ID, unauthorizedCases } from './product-cases';

let client: ProductClient;
test.beforeEach(({ request }) => { client = new ProductClient(request); });

let product: ProductDto;
test.beforeEach(async ({ productFactory }) => {
  product = await productFactory.create();
});

async function expectUnchanged(token: string) {
  const response = await client.getProductById(product.id, token);
  expect(await expectJson(response, 200)).toEqual(product);
}

test('204 - admin deletes a product', async ({ adminToken }) => {
  // given
  const id = product.id;

  // when
  const response = await client.deleteProduct(id, adminToken);

  // then
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe('');
  const persisted = await client.getProductById(id, adminToken);
  expect(await expectJson(persisted, 404)).toEqual({ message: 'Product not found' });
});

test('400 - reject malformed product ID', async ({ adminToken }) => {
  // given
  const invalidId = INVALID_PRODUCT_ID;

  // when
  const response = await client.deleteProduct(invalidId, adminToken);

  // then
  expect(response.status()).toBe(400);
  await expectUnchanged(adminToken);
});
for (const { label, token, message } of unauthorizedCases) {
  test(`401 - reject ${label}`, async ({ adminToken }) => {
    // given
    const id = product.id;

    // when
    const response = await client.deleteProduct(id, token);

    // then
    expect(await expectJson(response, 401)).toEqual({ message });
    await expectUnchanged(adminToken);
  });
}
test('403 - reject customer mutation', async ({ loggedInUser, adminToken }) => {
  // given
  const id = product.id;

  // when
  const response = await client.deleteProduct(id, loggedInUser.token);

  // then
  expect(await expectJson(response, 403)).toEqual({ message: 'Access denied' });
  await expectUnchanged(adminToken);
});
for (const id of ['0', '-1', '9223372036854775807']) {
  test(`404 - unknown ID ${id}`, async ({ adminToken }) => {
    // given
    const unknownId = id;

    // when
    const response = await client.deleteProduct(unknownId, adminToken);

    // then
    expect(response.status()).toBe(404);
    await expectUnchanged(adminToken);
  });
}
test('404 - already deleted product', async ({ adminToken }) => {
  // given
  expect((await client.deleteProduct(product.id, adminToken)).status()).toBe(204);

  // when
  const response = await client.deleteProduct(product.id, adminToken);

  // then
  expect(response.status()).toBe(404);
});
