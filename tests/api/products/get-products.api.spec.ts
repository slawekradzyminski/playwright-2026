import { expect } from '@playwright/test';
import { test } from '../../../fixtures/product-fixture';
import { GetProductsClient } from '../../../clients/products/get-products-client';
import { unauthorizedCases } from '../test-data/unauthorized-cases';

test.describe('GET /api/v1/products', () => {
  let client: GetProductsClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new GetProductsClient(request);
  });

  for (const role of ['admin', 'client'] as const) {
    test(`should read the product as ${role} - 200`, async ({ product, adminToken, authenticatedUser }) => {
      // given
      const token = role === 'admin' ? adminToken : authenticatedUser.token;

      // when
      const response = await client.get(token);

      // then
      expect(response.status()).toBe(200);
      const products = await response.json();
      expect(Array.isArray(products)).toBe(true);
      expect(products.filter((item: { id: number }) => item.id === product.id)).toEqual([product]);
    });
  }

  test('should reject unauthorized requests - 401', async ({ adminToken }) => {
    // given

    for (const { name, token, message } of unauthorizedCases(adminToken)) {
      await test.step(name, async () => {
        // when
        const response = await client.get(token);

        // then
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ message });
      });
    }
  });
});
