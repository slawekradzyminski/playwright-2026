import { expectJson, expectError } from '../../../validators/jsonResponse';
import { expect, test } from '../../../fixtures/inventory.fixture';
import { InventoryClient } from '../../../http/inventoryClient';
import { expectInventoryItem, expectStockStatus } from '../../../validators/inventoryResponse';

test.describe('GET /api/v1/admin/inventory/{productId}', () => {
  let inventoryClient: InventoryClient;

  test.beforeEach(({ request }) => {
    inventoryClient = new InventoryClient(request);
  });

  test('returns inventory detail and classifies stock - 200', async ({ inventoryProduct, adminToken }) => {
    // given

    // when
    const response = await inventoryClient.get(inventoryProduct.id, 'lowStockThreshold=2', adminToken);

    // then
    const item = await expectInventoryItem(response, 200);
    expect(item.productId).toBe(inventoryProduct.id);
    expect(item.name).toBe(inventoryProduct.name);
    expect(item.category).toBe(inventoryProduct.category);
    expect(item.availableQuantity).toBe(2);
    expectStockStatus(item.stockStatus, 'LOW_STOCK');
  });

  // BUG-015 (../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md): the runtime exposes this undocumented 400 as {error: ...}; retain the verified validation status only.
  test('rejects an invalid low-stock threshold - 400', async ({ inventoryProduct, adminToken }) => {
    // given

    // when
    const response = await inventoryClient.get(inventoryProduct.id, 'lowStockThreshold=0', adminToken);

    // then
    const body = await expectJson<{ error: string }>(response, 400);
    expect(body.error).toContain('lowStockThreshold');
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a request without a JWT token - 401', async ({ inventoryProduct }) => {
    // given

    // when
    const response = await inventoryClient.get(inventoryProduct.id);

    // then
    await expectError(response, 401, 'Unauthorized');
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a customer token - 403', async ({ inventoryProduct, loggedInUser }) => {
    // given

    // when
    const response = await inventoryClient.get(inventoryProduct.id, '', loggedInUser.token);

    // then
    await expectError(response, 403, 'Access denied');
  });
});
