import { DeleteProductClient } from '../../../clients/products/delete-product-client';
import { expect } from '@playwright/test';
import { test } from '../../../fixtures/api/product';
import { GetProductByIdClient } from '../../../clients/products/get-product-by-id-client';
import { unauthorizedCases } from '../test-data/unauthorized-cases';

test.describe('GET /api/v1/products/{id}', () => {
  let client: GetProductByIdClient;
  let deleteClient: DeleteProductClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new GetProductByIdClient(request);
    deleteClient = new DeleteProductClient(request);
  });

  for (const role of ['admin', 'client'] as const) {
    test(`should read the product as ${role} - 200`, async ({ product, adminToken, account }) => {
      // given
      const token = role === 'admin' ? adminToken : account.token;

      // when
      const response = await client.get(product.id, token);

      // then
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(product);
    });
  }

  test('should reject a nonnumeric identifier - 400', async ({ adminToken }) => {
    // given
    const token = adminToken;

    // when
    const response = await client.get('abc', token);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'For input string: "abc"' });
  });

  test('should reject unauthorized requests - 401', async ({ product, adminToken }) => {
    // given

    for (const { name, token, message } of unauthorizedCases(adminToken)) {
      await test.step(name, async () => {
        // when
        const response = await client.get(product.id, token);

        // then
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ message });
      });
    }
  });

  test('should return not found for a deleted product - 404', async ({ product, adminToken }) => {
    // given
    const token = adminToken;
    expect((await deleteClient.delete(product.id, adminToken)).status()).toBe(204);

    // when
    const response = await client.get(product.id, token);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Product not found' });
  });
});
