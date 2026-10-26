import { test, expect } from '../fixtures';
import { ProductsClient } from '../../../http/products-client';

test.describe('GET /api/v1/products', () => {
  test('returns the catalog to a client - 200', async ({ api, request }) => {
    // given
    const product = await api.createProduct();
    const { token } = await api.createUser();

    // when
    const response = await new ProductsClient(request, token).getAll();

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^application\/json\b/);
    expect(await response.json()).toEqual(expect.arrayContaining([product]));
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // when
    const response = await new ProductsClient(request).getAll();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects an invalid token - 401', async ({ request }) => {
    // when
    const response = await new ProductsClient(request, 'invalid-token').getAll();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid or expired token' });
  });
});
