import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';

test.describe('GET /api/v1/orders/{id}', () => {
  test('returns an owned order - 200', async ({ orders }) => {
    // given
    const { order } = await orders.placeOrder();

    // when
    const response = await orders.client.getById(order.id);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toEqual(order);
  });

  test('allows an administrator to read an owned test order - 200', async ({ api, orders }) => {
    // given
    const { order } = await orders.placeOrder();
    const client = await api.adminOrders();

    // when
    const response = await client.getById(order.id);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(order);
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OrdersClient(request).getById('9223372036854775807');

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('hides another user order - 404', async ({ api, orders, request }) => {
    // given
    const { order } = await orders.placeOrder();
    const other = await api.createUser();
    const client = new OrdersClient(request, other.token);

    // when
    const response = await client.getById(order.id);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Order not found' });
  });
});
