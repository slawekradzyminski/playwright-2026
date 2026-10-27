import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';

test.describe('PUT /api/v1/orders/{id}/status', () => {
  test('persists an administrator status change - 200', async ({ api, orders }) => {
    // given
    const { order, product, quantity } = await orders.placeOrder();
    const client = await api.adminOrders();

    // when
    const response = await client.updateStatus(order.id, 'SHIPPED');

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: order.id, status: 'SHIPPED' });
    await orders.expectStored(order, 'SHIPPED');
    await orders.expectStock(product, product.stockQuantity - quantity);
  });

  test('cancels an order and restores stock through status update - 200', async ({ api, orders }) => {
    // given
    const { order, product, quantity } = await orders.placeOrder();
    const client = await api.adminOrders();
    await orders.expectStock(product, product.stockQuantity - quantity);

    // when
    const response = await client.updateStatus(order.id, 'CANCELLED');

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: order.id, status: 'CANCELLED' });
    await orders.expectStored(order, 'CANCELLED');
    await orders.expectStock(product, product.stockQuantity);
  });

  test('rejects cancellation of an already cancelled order - 400', async ({ api, orders }) => {
    // given
    const { order, product } = await orders.placeOrder();
    expect((await orders.client.cancel(order.id)).status()).toBe(200);
    const client = await api.adminOrders();

    // when
    const response = await client.updateStatus(order.id, 'CANCELLED');

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Order cannot be cancelled in current status' });
    await orders.expectStored(order, 'CANCELLED');
    await orders.expectStock(product, product.stockQuantity);
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OrdersClient(request).updateStatus('9223372036854775807', 'PAID');

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects a client changing status without changing the order - 403', async ({ orders }) => {
    // given
    const { order, product, quantity } = await orders.placeOrder();

    // when
    const response = await orders.client.updateStatus(order.id, 'PAID');

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
    await orders.expectStored(order, 'PENDING');
    await orders.expectStock(product, product.stockQuantity - quantity);
  });

  test('returns not found for a missing order - 404', async ({ api }) => {
    // given
    const client = await api.adminOrders();

    // when
    const response = await client.updateStatus('9223372036854775807', 'PAID');

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Order not found' });
  });
});
