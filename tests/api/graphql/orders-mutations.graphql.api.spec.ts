import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';
import type { GqlOrder } from '../../../types/graphql';
import { expectData, expectFieldError } from './graphql-assertions';
import { expectOrder, shippingAddress } from './graphql-test-context';
import { CANCEL_ORDER, CHECKOUT, UPDATE_ORDER_STATUS } from './mutations';

const MISSING_ORDER_ID = '999999999';

test.describe('GraphQL orders mutations', () => {
  test.describe('Mutation.checkout', () => {
    test('places an order from the cart, empties the cart and deducts stock', async ({ request, graphql }) => {
      // given
      const headphones = await graphql.createProduct({ price: 12.5, stockQuantity: 8 });
      const speaker = await graphql.createProduct({ price: 3.25, stockQuantity: 4 });
      await graphql.addToCart(headphones, 2);
      await graphql.addToCart(speaker, 1);
      const lines = [{ product: headphones, quantity: 2 }, { product: speaker, quantity: 1 }];

      // when
      const response = await graphql.client.execute(CHECKOUT, { address: shippingAddress });

      // then
      const { checkout } = await expectData<{ checkout: GqlOrder }>(response);
      expectOrder(checkout, graphql.customer.user.username, lines);
      expect(checkout.totalAmount).toBe('28.25');
      await graphql.expectSavedCart([]);
      await graphql.expectStock(headphones, 6);
      await graphql.expectStock(speaker, 3);
      const saved = await new OrdersClient(request, graphql.customer.token).getById(checkout.id);
      expect(saved.status()).toBe(200);
      expect(await saved.json()).toMatchObject({ id: Number(checkout.id), status: 'PENDING', totalAmount: 28.25 });
    });

    test('rejects checkout of an empty cart - BAD_REQUEST', async ({ graphql }) => {
      // when
      const response = await graphql.client.execute(CHECKOUT, { address: shippingAddress });

      // then
      await expectFieldError(response, { field: 'checkout', code: 'BAD_REQUEST', message: 'Cart is empty' });
    });

    test('rejects an invalid postal code and keeps the cart - BAD_REQUEST', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 5 });
      await graphql.addToCart(product, 1);

      // when
      const response = await graphql.client.execute(CHECKOUT, { address: { ...shippingAddress, zipCode: 'not-a-zip' } });

      // then
      await expectFieldError(response, { field: 'checkout', code: 'BAD_REQUEST' });
      await graphql.expectSavedCart([{ product, quantity: 1 }]);
      await graphql.expectStock(product, 5);
    });

    test('rejects checkout after another customer bought the remaining stock - CONFLICT', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 3 });
      const other = await graphql.createCustomer();
      await graphql.addToCart(product, 2);
      await graphql.placeOrder([{ product, quantity: 2 }], other);

      // when
      const response = await graphql.client.execute(CHECKOUT, { address: shippingAddress });

      // then
      await expectFieldError(response, {
        field: 'checkout', code: 'CONFLICT', message: `Insufficient stock for product ${product.id}`,
      });
      await graphql.expectSavedCart([{ product, quantity: 2 }]);
      await graphql.expectStock(product, 1);
    });
  });

  test.describe('Mutation.cancelOrder', () => {
    test('cancels a pending order and restores stock only once', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 8 });
      const placed = await graphql.placeOrder([{ product, quantity: 2 }]);
      await graphql.expectStock(product, 6);

      // when
      const response = await graphql.client.execute(CANCEL_ORDER, { id: placed.id });

      // then
      const { cancelOrder } = await expectData<{ cancelOrder: GqlOrder }>(response);
      expect(cancelOrder).toMatchObject({ id: placed.id, status: 'CANCELLED', totalAmount: placed.totalAmount });
      await graphql.expectStock(product, 8);

      // when
      const repeated = await graphql.client.execute(CANCEL_ORDER, { id: placed.id });

      // then
      await expectFieldError(repeated, {
        field: 'cancelOrder', code: 'BAD_REQUEST', message: 'Order cannot be cancelled in current status',
      });
      await graphql.expectStock(product, 8);
    });

    test('forbids cancelling another customer order - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 5 });
      const owner = await graphql.createCustomer();
      const placed = await graphql.placeOrder([{ product, quantity: 1 }], owner);

      // when
      const response = await graphql.client.execute(CANCEL_ORDER, { id: placed.id });

      // then
      await expectFieldError(response, { field: 'cancelOrder', code: 'FORBIDDEN', message: 'Access denied' });
      await graphql.expectOrderStatus(placed, 'PENDING', owner);
      await graphql.expectStock(product, 4);
    });

    test('reports a missing order - NOT_FOUND', async ({ graphql }) => {
      // when
      const response = await graphql.client.execute(CANCEL_ORDER, { id: MISSING_ORDER_ID });

      // then
      await expectFieldError(response, { field: 'cancelOrder', code: 'NOT_FOUND', message: 'Order not found' });
    });
  });

  test.describe('Mutation.updateOrderStatus', () => {
    test('lets an administrator mark a customer order as paid', async ({ request, graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      const placed = await graphql.placeOrder([{ product, quantity: 1 }]);

      // when
      const response = await graphqlAdmin.execute(UPDATE_ORDER_STATUS, { id: placed.id, status: 'PAID' });

      // then
      const { updateOrderStatus } = await expectData<{ updateOrderStatus: GqlOrder }>(response);
      expect(updateOrderStatus).toMatchObject({ id: placed.id, status: 'PAID' });
      const saved = await new OrdersClient(request, graphql.customer.token).getById(placed.id);
      expect((await saved.json()).status).toBe('PAID');
    });

    test('restores stock when an administrator cancels through the status', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 6 });
      const placed = await graphql.placeOrder([{ product, quantity: 3 }]);

      // when
      const response = await graphqlAdmin.execute(UPDATE_ORDER_STATUS, { id: placed.id, status: 'CANCELLED' });

      // then
      expect((await expectData<{ updateOrderStatus: GqlOrder }>(response)).updateOrderStatus.status).toBe('CANCELLED');
      await graphql.expectStock(product, 6);
    });

    test('forbids customers from changing an order status - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const placed = await graphql.placeOrder([{ product, quantity: 1 }]);

      // when
      const response = await graphql.client.execute(UPDATE_ORDER_STATUS, { id: placed.id, status: 'DELIVERED' });

      // then
      await expectFieldError(response, { field: 'updateOrderStatus', code: 'FORBIDDEN' });
      await graphql.expectOrderStatus(placed, 'PENDING');
    });

    test('reports a missing order - NOT_FOUND', async ({ graphqlAdmin }) => {
      // when
      const response = await graphqlAdmin.execute(UPDATE_ORDER_STATUS, { id: MISSING_ORDER_ID, status: 'PAID' });

      // then
      await expectFieldError(response, { field: 'updateOrderStatus', code: 'NOT_FOUND', message: 'Order not found' });
    });
  });
});
