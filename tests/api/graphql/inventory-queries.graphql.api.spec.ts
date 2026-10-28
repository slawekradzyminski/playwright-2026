import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures';
import type { GqlInventoryItem, GqlInventoryMovement, GqlPage } from '../../../types/graphql';
import { expectData, expectFieldError } from './graphql-assertions';
import { CANCEL_ORDER, UPDATE_PRODUCT } from './mutations';
import { INVENTORY, INVENTORY_ITEM, INVENTORY_MOVEMENTS } from './queries';

const MISSING_PRODUCT_ID = '999999999';

test.describe('GraphQL inventory queries', () => {
  test.describe('Query.inventory', () => {
    test('finds a product by name and classifies it against the low-stock threshold', async ({ graphql, graphqlAdmin }) => {
      // given
      const name = `Inventory lamp ${randomUUID()}`;
      const product = await graphql.createProduct({ name, stockQuantity: 4 });

      // when
      const lowStock = await graphqlAdmin.execute(INVENTORY, { page: 0, size: 10, search: name, status: 'LOW_STOCK', lowStockThreshold: 5 });
      const inStock = await graphqlAdmin.execute(INVENTORY, { page: 0, size: 10, search: name, status: 'IN_STOCK', lowStockThreshold: 3 });

      // then
      const { inventory: low } = await expectData<{ inventory: GqlPage<GqlInventoryItem> }>(lowStock);
      expect(low.total).toBe(1);
      expect(low.items[0]).toMatchObject({
        productId: String(product.id), name, category: product.category, availableQuantity: 4, stockStatus: 'LOW_STOCK',
      });
      const { inventory: high } = await expectData<{ inventory: GqlPage<GqlInventoryItem> }>(inStock);
      expect(high.items.map(item => item.stockStatus)).toEqual(['IN_STOCK']);
    });

    test('forbids customers from browsing inventory - FORBIDDEN', async ({ graphql }) => {
      // when
      const response = await graphql.client.execute(INVENTORY, { page: 0, size: 10, lowStockThreshold: 10 });

      // then
      await expectFieldError(response, { field: 'inventory', code: 'FORBIDDEN', message: 'Access denied' });
    });
  });

  test.describe('Query.inventoryItem', () => {
    test('reports a sold-out product as out of stock', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 0 });

      // when
      const response = await graphqlAdmin.execute(INVENTORY_ITEM, { productId: String(product.id), lowStockThreshold: 10 });

      // then
      const { inventoryItem } = await expectData<{ inventoryItem: GqlInventoryItem }>(response);
      expect(inventoryItem).toEqual({
        productId: String(product.id), name: product.name, category: product.category,
        availableQuantity: 0, stockStatus: 'OUT_OF_STOCK', lastChangedAt: expect.any(String),
      });
    });

    test('rejects a low-stock threshold below one - BAD_REQUEST', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphqlAdmin.execute(INVENTORY_ITEM, { productId: String(product.id), lowStockThreshold: 0 });

      // then
      await expectFieldError(response, { field: 'inventoryItem', code: 'BAD_REQUEST' });
    });

    test('reports a missing product - NOT_FOUND', async ({ graphqlAdmin }) => {
      // when
      const response = await graphqlAdmin.execute(INVENTORY_ITEM, { productId: MISSING_PRODUCT_ID, lowStockThreshold: 10 });

      // then
      await expectFieldError(response, { field: 'inventoryItem', code: 'NOT_FOUND', message: 'Product not found' });
    });
  });

  test.describe('Query.inventoryMovements', () => {
    test('records initial stock, order deduction and cancellation newest first', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 8 });
      const order = await graphql.placeOrder([{ product, quantity: 3 }]);
      await expectData(await graphql.client.execute(CANCEL_ORDER, { id: order.id }));

      // when
      const response = await graphqlAdmin.execute(INVENTORY_MOVEMENTS, { productId: String(product.id), page: 0, size: 10 });

      // then
      const { inventoryMovements } = await expectData<{ inventoryMovements: GqlPage<GqlInventoryMovement> }>(response);
      expect(inventoryMovements.total).toBe(3);
      expect(inventoryMovements.items.map(({ type, delta, quantityAfter, orderId, actor }) => ({ type, delta, quantityAfter, orderId, actor })))
        .toEqual([
          { type: 'ORDER_RESTORED', delta: 3, quantityAfter: 8, orderId: order.id, actor: graphql.customer.user.username },
          { type: 'ORDER_DEDUCTED', delta: -3, quantityAfter: 5, orderId: order.id, actor: graphql.customer.user.username },
          { type: 'INITIAL_STOCK', delta: 8, quantityAfter: 8, orderId: null, actor: 'admin' },
        ]);
    });

    test('records a stock change made by a product update', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 3 });
      await expectData(await graphqlAdmin.execute(UPDATE_PRODUCT, { id: String(product.id), input: { stockQuantity: 7 } }));

      // when
      const response = await graphqlAdmin.execute(INVENTORY_MOVEMENTS, { productId: String(product.id), page: 0, size: 1 });

      // then
      const { inventoryMovements } = await expectData<{ inventoryMovements: GqlPage<GqlInventoryMovement> }>(response);
      expect(inventoryMovements.total).toBe(2);
      expect(inventoryMovements.items[0]).toMatchObject({
        type: 'ADMIN_ADJUSTMENT', delta: 4, quantityAfter: 7, reason: 'Product update',
      });
      await graphql.expectStock(product, 7);
    });

    test('forbids customers from reading stock history - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphql.client.execute(INVENTORY_MOVEMENTS, { productId: String(product.id), page: 0, size: 10 });

      // then
      await expectFieldError(response, { field: 'inventoryMovements', code: 'FORBIDDEN' });
    });
  });
});
