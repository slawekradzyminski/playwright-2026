import { test, expect } from '../fixtures';
import { ProductsClient } from '../../../http/products-client';
import { expectProduct } from './product-assertions';

test.describe('GET /api/v1/products/{id}', () => {
  test('returns a product to a client - 200', async ({ api, request }) => {
    // given
    const product = await api.createProduct();
    const { token } = await api.createUser();

    // when
    const response = await new ProductsClient(request, token).getById(product.id);

    // then
    expect(response.status()).toBe(200);
    const body = await response.json();
    expectProduct(body, product);
    expect(body).toEqual(product);
  });

  test('rejects a malformed ID - 400', async ({ api }) => {
    // given
    const products = await api.adminProducts();

    // when
    const response = await products.getById('abc');

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });

  test('rejects a request without a token - 401', async ({ api, request }) => {
    // given
    const product = await api.createProduct();

    // when
    const response = await new ProductsClient(request).getById(product.id);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('returns not found for a deleted product - 404', async ({ api }) => {
    // given
    const product = await api.createProduct();
    await api.deleteProduct(product.id);
    const products = await api.adminProducts();

    // when
    const response = await products.getById(product.id);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Product not found' });
  });
});
