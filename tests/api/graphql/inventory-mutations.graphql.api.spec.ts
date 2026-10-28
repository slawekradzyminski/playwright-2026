import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures';
import type { GqlInventoryMovement } from '../../../types/graphql';
import { expectData, expectFieldError } from './graphql-assertions';
import { ADJUST_INVENTORY } from './mutations';

function restock(delta: number, reason = 'Supplier delivery', requestId: string = randomUUID()) {
  return { delta, reason, requestId };
}

test.describe('GraphQL inventory mutations', () => {
  test.describe('Mutation.adjustInventory', () => {
    test('restocks a product and records the administrator as the actor', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 10 });
      const input = restock(5);

      // when
      const response = await graphqlAdmin.execute(ADJUST_INVENTORY, { productId: String(product.id), input });

      // then
      const { adjustInventory } = await expectData<{ adjustInventory: GqlInventoryMovement }>(response);
      expect(adjustInventory).toEqual({
        id: expect.stringMatching(/^[1-9]\d*$/), productId: String(product.id), orderId: null, type: 'ADMIN_ADJUSTMENT',
        delta: 5, quantityAfter: 15, actor: 'admin', reason: input.reason, requestId: input.requestId,
        createdAt: expect.any(String),
      });
      await graphql.expectStock(product, 15);
    });

    test('returns the original movement when the same request is retried', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 8 });
      const input = restock(2);
      const first = await expectData<{ adjustInventory: GqlInventoryMovement }>(
        await graphqlAdmin.execute(ADJUST_INVENTORY, { productId: String(product.id), input }));

      // when
      const response = await graphqlAdmin.execute(ADJUST_INVENTORY, { productId: String(product.id), input });

      // then
      expect(await expectData(response)).toEqual(first);
      await graphql.expectStock(product, 10);
    });

    test('rejects a zero adjustment - BAD_REQUEST', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 5 });

      // when
      const response = await graphqlAdmin.execute(ADJUST_INVENTORY, { productId: String(product.id), input: restock(0) });

      // then
      await expectFieldError(response, { field: 'adjustInventory', code: 'BAD_REQUEST' });
      await graphql.expectStock(product, 5);
    });

    test('forbids customers from adjusting stock - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 5 });

      // when
      const response = await graphql.client.execute(ADJUST_INVENTORY, { productId: String(product.id), input: restock(100) });

      // then
      await expectFieldError(response, { field: 'adjustInventory', code: 'FORBIDDEN', message: 'Access denied' });
      await graphql.expectStock(product, 5);
    });

    test('rejects reusing a request ID with a different quantity - CONFLICT', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 8 });
      const input = restock(2);
      await expectData(await graphqlAdmin.execute(ADJUST_INVENTORY, { productId: String(product.id), input }));

      // when
      const response = await graphqlAdmin.execute(ADJUST_INVENTORY, { productId: String(product.id), input: { ...input, delta: 3 } });

      // then
      await expectFieldError(response, {
        field: 'adjustInventory', code: 'CONFLICT', message: 'requestId already used with different payload',
      });
      await graphql.expectStock(product, 10);
    });

    test('refuses to take stock below zero - CONFLICT', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 4 });

      // when
      const response = await graphqlAdmin.execute(ADJUST_INVENTORY, {
        productId: String(product.id), input: restock(-5, 'Damaged in warehouse'),
      });

      // then
      await expectFieldError(response, { field: 'adjustInventory', code: 'CONFLICT', message: 'Insufficient stock' });
      await graphql.expectStock(product, 4);
    });
  });
});
