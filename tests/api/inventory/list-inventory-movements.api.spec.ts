import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { test } from '../../../fixtures/inventory-fixture';
import { AdjustInventoryClient } from '../../../clients/inventory/adjust-inventory-client';
import { ListInventoryMovementsClient } from '../../../clients/inventory/list-inventory-movements-client';
import { unauthorizedCases } from '../test-data/unauthorized-cases';

test.describe('GET /api/v1/admin/inventory/{productId}/movements', () => {
  let client: ListInventoryMovementsClient;
  let adjustmentClient: AdjustInventoryClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new ListInventoryMovementsClient(request);
    adjustmentClient = new AdjustInventoryClient(request);
  });

  test('should return the fixture product movement history - 200', async ({ inventoryProduct, adminToken }) => {
    // given
    const product = inventoryProduct;

    // when
    const response = await client.list(product.id, adminToken);

    // then
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ pageNumber: 0, pageSize: 20, totalElements: expect.any(Number) });
    expect(body.content).toEqual(expect.arrayContaining([
      expect.objectContaining({
        productId: product.id,
        type: 'INITIAL_STOCK',
        delta: product.stockQuantity,
        quantityAfter: product.stockQuantity,
      }),
    ]));
  });

  test('should paginate movements newest first without duplicates - 200', async ({ inventoryProduct, adminToken }) => {
    // given
    const requestId = randomUUID();
    const adjustment = await adjustmentClient.adjust(inventoryProduct.id, { delta: 1, reason: 'History pagination', requestId }, adminToken);
    expect(adjustment.status()).toBe(201);
    const movement = await adjustment.json();

    // when
    const firstPage = await client.list(inventoryProduct.id, adminToken, { page: 0, size: 1 });
    const secondPage = await client.list(inventoryProduct.id, adminToken, { page: 1, size: 1 });

    // then
    expect(firstPage.status()).toBe(200);
    expect(secondPage.status()).toBe(200);
    const first = await firstPage.json();
    const second = await secondPage.json();
    expect(first).toMatchObject({ pageNumber: 0, pageSize: 1, totalElements: 2, totalPages: 2, content: [movement] });
    expect(second).toMatchObject({ pageNumber: 1, pageSize: 1, totalElements: 2, totalPages: 2 });
    expect(second.content).toHaveLength(1);
    expect(second.content[0]).toMatchObject({ productId: inventoryProduct.id, type: 'INITIAL_STOCK', delta: 5, quantityAfter: 5 });
    expect(second.content[0].id).not.toBe(movement.id);
  });

  test('should reject unauthenticated requests - 401', async ({ inventoryProduct, adminToken }) => {
    // given
    for (const { name, token, message } of unauthorizedCases(adminToken)) {
      await test.step(name, async () => {
        // when
        const response = await client.list(inventoryProduct.id, token);

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
    const response = await client.list(inventoryProduct.id, token);

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
  });


  test('should report a missing product - 404', async ({ adminToken }) => {
    // given
    const productId = -1;

    // when
    const response = await client.list(productId, adminToken);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Product not found' });
  });
});
