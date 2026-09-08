import { expectJson, expectError } from '../../../validators/jsonResponse';
import { expect, test } from '../../../fixtures/inventory.fixture';
import { InventoryClient } from '../../../http/inventoryClient';
import { expectInventoryItem, expectValidMovement } from '../../../validators/inventoryResponse';
import { ADMIN_USERNAME } from '../../../test-config';
import { randomUUID } from 'node:crypto';

test.describe('POST /api/v1/admin/inventory/{productId}/adjustments', () => {
  let inventoryClient: InventoryClient;

  test.beforeEach(({ request }) => {
    inventoryClient = new InventoryClient(request);
  });

  test('records an adjustment and is idempotent for an identical request - 201', async ({ inventoryProduct, adminToken }) => {
    // given
    const payload = { delta: 3, reason: 'inventory delivery', requestId: randomUUID() };

    // when
    const firstResponse = await inventoryClient.adjust(inventoryProduct.id, payload, adminToken);
    const replayResponse = await inventoryClient.adjust(inventoryProduct.id, payload, adminToken);
    const detailResponse = await inventoryClient.get(inventoryProduct.id, '', adminToken);

    // then
    const first = await expectJson(firstResponse, 201);
    const replay = await expectJson(replayResponse, 201);
    expectValidMovement(first);
    expectValidMovement(replay);
    expect(replay).toEqual(first);
    expect(first).toMatchObject({ productId: inventoryProduct.id, delta: 3, reason: payload.reason, requestId: payload.requestId, actor: ADMIN_USERNAME, type: 'ADMIN_ADJUSTMENT', orderId: null, quantityAfter: 5 });
    const history = await expectJson<{ totalElements: number; content: Array<{ id: number }> }>(await inventoryClient.movements(inventoryProduct.id, '', adminToken), 200);
    expect(history.totalElements).toBe(2);
    expect(history.content.filter(movement => movement.id === first.id)).toHaveLength(1);
    const detail = await expectInventoryItem(detailResponse, 200);
    expect(detail.availableQuantity).toBe(5);
  });

  // BUG-015 (../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md): DTO validation returns a documented-by-runtime 400 field error rather than the general ErrorDto message shape.
  test('rejects a zero adjustment without changing inventory - 400', async ({ inventoryProduct, adminToken }) => {
    // given

    // when
    const response = await inventoryClient.adjust(inventoryProduct.id, {
      delta: 0,
      reason: 'zero adjustment',
      requestId: randomUUID()
    }, adminToken);

    // then
    const body = await expectJson<{ deltaNonZero: string }>(response, 400);
    expect(body).toEqual({ deltaNonZero: 'delta must not be zero' });
    const detail = await expectInventoryItem(await inventoryClient.get(inventoryProduct.id, '', adminToken), 200);
    expect(detail.availableQuantity).toBe(inventoryProduct.stockQuantity);
    expect((await expectJson(await inventoryClient.movements(inventoryProduct.id, '', adminToken), 200)).totalElements).toBe(1);
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a request without a JWT token - 401', async ({ inventoryProduct, adminToken }) => {
    // given

    // when
    const response = await inventoryClient.adjust(inventoryProduct.id, {
      delta: 1,
      reason: 'unauthenticated',
      requestId: randomUUID()
    });

    // then
    await expectError(response, 401, 'Unauthorized');
    expect((await expectInventoryItem(await inventoryClient.get(inventoryProduct.id, '', adminToken), 200)).availableQuantity).toBe(2);
    expect((await expectJson(await inventoryClient.movements(inventoryProduct.id, '', adminToken), 200)).totalElements).toBe(1);
  });

  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  test('rejects a customer token - 403', async ({ inventoryProduct, loggedInUser, adminToken }) => {
    // given

    // when
    const response = await inventoryClient.adjust(inventoryProduct.id, {
      delta: 1,
      reason: 'forbidden',
      requestId: randomUUID()
    }, loggedInUser.token);

    // then
    await expectError(response, 403, 'Access denied');
    expect((await expectInventoryItem(await inventoryClient.get(inventoryProduct.id, '', adminToken), 200)).availableQuantity).toBe(2);
    expect((await expectJson(await inventoryClient.movements(inventoryProduct.id, '', adminToken), 200)).totalElements).toBe(1);
  });
  // BUG-015: ../../../reports/bugs/BUG-015-inventory-invalid-query-and-path-error-schema.md.
  for (const scenario of ['conflicting replay', 'insufficient stock'] as const) {
    test(`rejects ${scenario} without changing stock or history - 409`, async ({ inventoryProduct, adminToken }) => {
      // given
      const original = { delta: 3, reason: 'delivery', requestId: randomUUID() };
      await expectJson(await inventoryClient.adjust(inventoryProduct.id, original, adminToken), 201);
      const rejected = scenario === 'conflicting replay'
        ? { ...original, delta: 4 }
        : { delta: -6, reason: 'correction', requestId: randomUUID() };

      // when
      const response = await inventoryClient.adjust(inventoryProduct.id, rejected, adminToken);

      // then
      await expectError(response, 409, scenario === 'conflicting replay' ? 'requestId already used with different payload' : 'Insufficient stock');
      expect((await expectInventoryItem(await inventoryClient.get(inventoryProduct.id, '', adminToken), 200)).availableQuantity).toBe(5);
      expect((await expectJson(await inventoryClient.movements(inventoryProduct.id, '', adminToken), 200)).totalElements).toBe(2);
    });
  }

});
