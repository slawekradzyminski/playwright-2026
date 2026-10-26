import { test, expect } from '../fixtures';
import { generateProduct } from '../../../generators/product-generator';
import { ProductsClient } from '../../../http/products-client';
import { expectProduct } from './product-assertions';

test.describe('PUT /api/v1/products/{id}', () => {
  test('updates and persists all product fields - 200', async ({ api }) => {
    // given
    const product = await api.createProduct();
    const products = await api.adminProducts();
    const payload = { ...generateProduct(), stockQuantity: product.stockQuantity + 1 };

    // when
    const response = await products.update(product.id, payload);

    // then
    expect(response.status()).toBe(200);
    const body = await response.json();
    expectProduct(body, payload);
    expect(body.id).toBe(product.id);
    expect(body.createdAt).toBe(product.createdAt);
    expect(body.updatedAt >= product.updatedAt).toBe(true);
    const stored = await products.getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(body);
  });

  test('updates supplied fields while preserving omitted and null fields - 200', async ({ api }) => {
    // given
    const product = await api.createProduct();
    const products = await api.adminProducts();

    // when
    const response = await products.update(product.id, {
      name: null,
      description: '',
      imageUrl: '',
      stockQuantity: null,
    });

    // then
    expect(response.status()).toBe(200);
    const body = await response.json();
    expectProduct(body, { ...product, description: '', imageUrl: '' });
    expect(body).toEqual({ ...product, description: '', imageUrl: '', updatedAt: expect.any(String) });
    const stored = await products.getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(body);
  });

  test('rejects a negative price without changing the product - 400', async ({ api }) => {
    // given
    const product = await api.createProduct();
    const products = await api.adminProducts();

    // when
    const response = await products.update(product.id, { price: -1 });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ price: 'Price must be greater than 0' });
    const stored = await products.getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(product);
  });

  test('rejects a request without a token - 401', async ({ api, request }) => {
    // given
    const product = await api.createProduct();

    // when
    const response = await new ProductsClient(request).update(product.id, { price: 1 });

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
    const stored = await (await api.adminProducts()).getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(product);
  });

  test('rejects a client update without changing the product - 403', async ({ api, request }) => {
    // given
    const product = await api.createProduct();
    const { token } = await api.createUser();

    // when
    const response = await new ProductsClient(request, token).update(product.id, { price: 1 });

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
    const stored = await (await api.adminProducts()).getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(product);
  });

  test('returns not found for a deleted product - 404', async ({ api }) => {
    // given
    const product = await api.createProduct();
    await api.deleteProduct(product.id);
    const products = await api.adminProducts();

    // when
    const response = await products.update(product.id, { price: 1 });

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Product not found' });
  });
});
