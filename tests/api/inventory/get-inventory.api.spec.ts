import { expect } from '@playwright/test';
import { test } from '../../../fixtures/inventory-fixture';
import { GetInventoryClient } from '../../../clients/inventory/get-inventory-client';
import { unauthorizedCases } from '../test-data/unauthorized-cases';

test.describe('GET /api/v1/admin/inventory/{productId}', () => {
  let client: GetInventoryClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new GetInventoryClient(request);
  });

  test('should return the fixture product stock - 200', async ({ inventoryProduct, adminToken }) => {
    // given
    const product = inventoryProduct;

    // when
    const response = await client.get(product.id, adminToken);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      productId: product.id,
      name: product.name,
      category: product.category,
      availableQuantity: 5,
      stockStatus: 'LOW_STOCK',
      lastChangedAt: expect.any(String),
    }));
  });

  test('should classify stock above a custom threshold - 200', async ({ inventoryProduct, adminToken }) => {
    // given
    const threshold = 4;

    // when
    const response = await client.get(inventoryProduct.id, adminToken, threshold);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ availableQuantity: 5, stockStatus: 'IN_STOCK' });
  });

  test('should reject an invalid threshold - 400', async ({ inventoryProduct, adminToken }) => {
    // given
    const threshold = 0;

    // when
    const response = await client.get(inventoryProduct.id, adminToken, threshold);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'lowStockThreshold must be at least 1' });
  });

  test('should reject unauthenticated requests - 401', async ({ inventoryProduct, adminToken }) => {
    // given
    for (const { name, token, message } of unauthorizedCases(adminToken)) {
      await test.step(name, async () => {
        // when
        const response = await client.get(inventoryProduct.id, token);

        // then
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ message });
      });
    }
  });

  test('should forbid a regular client - 403', async ({ inventoryProduct, authenticatedUser }) => {
    // given
    const token = authenticatedUser.token;

    // when
    const response = await client.get(inventoryProduct.id, token);

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
  });


  test('should report a missing inventory item - 404', async ({ adminToken }) => {
    // given
    const productId = -1;

    // when
    const response = await client.get(productId, adminToken);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Product not found' });
  });
});
