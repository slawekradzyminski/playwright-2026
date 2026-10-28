import { test, expect } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { OrdersClient } from '../../../http/orders-client';
import type { GqlOrder, GqlPage } from '../../../types/graphql';
import type { OrderDto } from '../../../types/order';
import { cents, expectData, expectFieldError } from './graphql-assertions';
import { expectOrder, shippingAddress } from './graphql-test-context';
import { CANCEL_ORDER } from './mutations';
import { ORDER, ORDERS } from './queries';

test.describe('GraphQL orders queries', () => {
  test.describe('Query.orders', () => {
    test('shows a customer only their own order history', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const own = await graphql.placeOrder([{ product, quantity: 1 }]);
      await graphql.placeOrder([{ product, quantity: 2 }], await graphql.createCustomer());

      // when
      const response = await graphql.client.execute(ORDERS, { page: 0, size: 20 });

      // then
      const { orders } = await expectData<{ orders: GqlPage<GqlOrder> }>(response);
      expect(orders).toMatchObject({ total: 1, page: 0, size: 20 });
      expect(orders.items).toEqual([own]);
    });

    test('lets an administrator filter all orders by customer and status', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      const cancelled = await graphql.placeOrder([{ product, quantity: 1 }]);
      await expectData(await graphql.client.execute(CANCEL_ORDER, { id: cancelled.id }));
      const pending = await graphql.placeOrder([{ product, quantity: 1 }]);

      // when
      const response = await graphqlAdmin.execute(ORDERS, {
        username: graphql.customer.user.username, status: 'PENDING', page: 0, size: 20,
      });

      // then
      const { orders } = await expectData<{ orders: GqlPage<GqlOrder> }>(response);
      expect(orders.total).toBe(1);
      expect(orders.items.map(order => order.id)).toEqual([pending.id]);
    });

    test('forbids a customer from listing another customer orders - FORBIDDEN', async ({ graphql }) => {
      // given
      const other = await graphql.createCustomer();

      // when
      const response = await graphql.client.execute(ORDERS, { username: other.user.username, page: 0, size: 20 });

      // then
      await expectFieldError(response, { field: 'orders', code: 'FORBIDDEN', message: 'Access denied' });
    });
  });

  test.describe('Query.order', () => {
    test('shows an order placed through REST with its items and address', async ({ request, graphql }) => {
      // given
      const product = await graphql.createProduct({ price: 7.5 });
      const restCart = new CartClient(request, graphql.customer.token);
      expect((await restCart.addItem({ productId: product.id, quantity: 3 })).status()).toBe(200);
      const placed = await new OrdersClient(request, graphql.customer.token).create(shippingAddress);
      expect(placed.status()).toBe(201);
      const restOrder: OrderDto = await placed.json();

      // when
      const response = await graphql.client.execute(ORDER, { id: String(restOrder.id) });

      // then
      const { order } = await expectData<{ order: GqlOrder }>(response);
      expectOrder(order, graphql.customer.user.username, [{ product, quantity: 3 }]);
      expect(order.id).toBe(String(restOrder.id));
      expect(cents(order.totalAmount)).toBe(cents(restOrder.totalAmount));
    });

    test('lets an administrator open any customer order', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      const placed = await graphql.placeOrder([{ product, quantity: 1 }]);

      // when
      const response = await graphqlAdmin.execute(ORDER, { id: placed.id });

      // then
      expect((await expectData<{ order: GqlOrder }>(response)).order).toEqual(placed);
    });

    test('hides another customer order as missing - NOT_FOUND', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const foreign = await graphql.placeOrder([{ product, quantity: 1 }], await graphql.createCustomer());

      // when
      const response = await graphql.client.execute(ORDER, { id: foreign.id });

      // then
      await expectFieldError(response, { field: 'order', code: 'NOT_FOUND', message: 'Order not found' });
    });
  });
});
