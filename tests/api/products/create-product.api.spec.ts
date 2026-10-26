import { test, expect } from '../fixtures';
import { generateProduct } from '../../../generators/product-generator';
import { ProductsClient } from '../../../http/products-client';
import { expectProduct } from './product-assertions';

test.describe('POST /api/v1/products', () => {
  test('creates and persists a product - 201', async ({ api }) => {
    // given
    const payload = generateProduct();
    const products = await api.adminProducts();

    // when
    const response = await products.create(payload);
    if (response.status() === 201) api.trackProduct(await response.json());

    // then
    expect(response.status()).toBe(201);
    const body = await response.json();
    expectProduct(body, payload);
    const stored = await products.getById(body.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(body);
  });

  test('rejects a negative price - 400', async ({ api }) => {
    // given
    const products = await api.adminProducts();
    const payload = { ...generateProduct(), price: -1 };

    // when
    const response = await products.create(payload);
    if (response.status() === 201) api.trackProduct(await response.json());

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ price: 'Price must be greater than 0' });
  });

  test('rejects a request without a token - 401', async ({ api, request }) => {
    // given
    const payload = generateProduct();

    // when
    const response = await new ProductsClient(request).create(payload);
    if (response.status() === 201) api.trackProduct(await response.json());

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects a client creating a product - 403', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    const payload = generateProduct();

    // when
    const response = await new ProductsClient(request, token).create(payload);
    if (response.status() === 201) api.trackProduct(await response.json());

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
  });
});
