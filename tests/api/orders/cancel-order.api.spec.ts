import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';

test.describe('POST /api/v1/orders/{id}/cancel', () => {
  test('persists cancellation and restores deducted stock - 200', async ({ orders }) => {
    // given
    const { order, product, quantity } = await orders.placeOrder();
    await orders.expectStock(product, product.stockQuantity - quantity);

    // when
    const response = await orders.client.cancel(order.id);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: order.id, status: 'CANCELLED' });
    await orders.expectStored(order, 'CANCELLED');
    await orders.expectStock(product, product.stockQuantity);
  });

  test('rejects repeated cancellation without restoring stock twice - 400', async ({ orders }) => {
    // given
    const { order, product } = await orders.placeOrder();
    expect((await orders.client.cancel(order.id)).status()).toBe(200);

    // when
    const response = await orders.client.cancel(order.id);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Order cannot be cancelled in current status' });
    await orders.expectStored(order, 'CANCELLED');
    await orders.expectStock(product, product.stockQuantity);
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OrdersClient(request).cancel('9223372036854775807');

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('forbids another client without changing order or stock - 403', async ({ api, orders, request }) => {
    // given
    const { order, product, quantity } = await orders.placeOrder();
    const other = await api.createUser();
    const client = new OrdersClient(request, other.token);

    // when
    const response = await client.cancel(order.id);

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: "You cannot cancel someone else's order" });
    await orders.expectStored(order, 'PENDING');
    await orders.expectStock(product, product.stockQuantity - quantity);
  });

  test('returns not found for a missing order - 404', async ({ orders }) => {
    // when
    const response = await orders.client.cancel('9223372036854775807');

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Order not found' });
  });
});
