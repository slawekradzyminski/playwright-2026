import { expectJson, expectError } from '../../../validators/jsonResponse';
import { expect, test } from '../../../fixtures/inventory.fixture';
import { InventoryClient } from '../../../http/inventoryClient';
import { expectValidInventoryPage, expectStockStatus } from '../../../validators/inventoryResponse';

test.describe('GET /api/v1/admin/inventory', () => {
  let inventoryClient: InventoryClient;

  test.beforeEach(({ request }) => {
    inventoryClient = new InventoryClient(request);
  });

  test('lists inventory with search, status and pagination metadata - 200', async ({ inventoryProduct, adminToken }) => {
    // given

    // when
    const response = await inventoryClient.list(`search=${encodeURIComponent(inventoryProduct.name)}&status=LOW_STOCK&lowStockThreshold=5&page=0&size=1`, adminToken);

    // then
    const page = await expectJson(response, 200);
    expectValidInventoryPage(page);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(1);
    expect(page.content).toHaveLength(1);
    expect(page.content[0].productId).toBe(inventoryProduct.id);
    expectStockStatus(page.content[0].stockStatus, 'LOW_STOCK');
  });

  // BUG-015 (../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md): the runtime exposes this undocumented 400 as {error: ...}; retain the verified validation status only.
  test('rejects an invalid low-stock threshold - 400', async ({ adminToken }) => {
    // given

    // when
    const response = await inventoryClient.list('lowStockThreshold=0', adminToken);

    // then
    const body = await expectJson<{ error: string }>(response, 400);
    expect(body.error).toContain('lowStockThreshold');
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a request without a JWT token - 401', async () => {
    // given

    // when
    const response = await inventoryClient.list();

    // then
    await expectError(response, 401, 'Unauthorized');
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a customer token - 403', async ({ loggedInUser }) => {
    // given

    // when
    const response = await inventoryClient.list('', loggedInUser.token);

    // then
    await expectError(response, 403, 'Access denied');
  });


});
