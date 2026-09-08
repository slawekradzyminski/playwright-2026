import { expectJson, expectError } from '../../../validators/jsonResponse';
import { expect, test } from '../../../fixtures/inventory.fixture';
import { InventoryClient } from '../../../http/inventoryClient';
import { expectValidMovementPage } from '../../../validators/inventoryResponse';
import { randomUUID } from 'node:crypto';

test.describe('GET /api/v1/admin/inventory/{productId}/movements', () => {
  let inventoryClient: InventoryClient;

  test.beforeEach(({ request }) => {
    inventoryClient = new InventoryClient(request);
  });

  test('returns newest movements first with pagination - 200', async ({ inventoryProduct, adminToken }) => {
    // given
    const adjustment = await inventoryClient.adjust(inventoryProduct.id, {
      delta: 1,
      reason: 'movement ordering probe',
      requestId: randomUUID()
    }, adminToken);
    const recorded = await expectJson(adjustment, 201);

    // when
    const firstPageResponse = await inventoryClient.movements(inventoryProduct.id, 'page=0&size=1', adminToken);
    const secondPageResponse = await inventoryClient.movements(inventoryProduct.id, 'page=1&size=1', adminToken);

    // then
    const firstPage = await expectJson(firstPageResponse, 200);
    const secondPage = await expectJson(secondPageResponse, 200);
    expectValidMovementPage(firstPage);
    expectValidMovementPage(secondPage);
    expect(firstPage.pageNumber).toBe(0);
    expect(firstPage.pageSize).toBe(1);
    expect(firstPage.totalElements).toBe(2);
    expect(firstPage.totalPages).toBe(2);
    expect(firstPage.content).toHaveLength(1);
    expect(firstPage.content[0].id).toBe(recorded.id);
    expect(firstPage.content[0].productId).toBe(inventoryProduct.id);
    expect(firstPage.content[0].type).toBe('ADMIN_ADJUSTMENT');
    expect(secondPage.pageNumber).toBe(1);
    expect(secondPage.content).toHaveLength(1);
    expect(secondPage.content[0]).toMatchObject({ productId: inventoryProduct.id, type: 'INITIAL_STOCK', delta: 2, quantityAfter: 2 });
    expect(secondPage.content[0].id).not.toBe(recorded.id);
    expect(secondPage.content[0].createdAt <= firstPage.content[0].createdAt).toBe(true);
  });

  // BUG-015 (../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md): the runtime exposes this undocumented binding 400 as {error: ...}; retain the verified validation status only.
  test('rejects a non-numeric product ID - 400', async ({ adminToken }) => {
    // given

    // when
    const response = await inventoryClient.movements('not-a-number', '', adminToken);

    // then
    const body = await expectJson<{ error: string }>(response, 400);
    expect(body.error).toContain('not-a-number');
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a request without a JWT token - 401', async ({ inventoryProduct }) => {
    // given

    // when
    const response = await inventoryClient.movements(inventoryProduct.id);

    // then
    await expectError(response, 401, 'Unauthorized');
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a customer token - 403', async ({ inventoryProduct, loggedInUser }) => {
    // given

    // when
    const response = await inventoryClient.movements(inventoryProduct.id, '', loggedInUser.token);

    // then
    await expectError(response, 403, 'Access denied');
  });
});
