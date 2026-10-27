import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';
import type { OrderPageDto } from '../../../types/order';

test.describe('GET /api/v1/orders/admin', () => {
  test('returns a filtered page to an administrator - 200', async ({ api, orders }) => {
    // given
    await orders.placeOrder();
    const client = await api.adminOrders();

    // when
    const response = await client.getAll({ page: 0, size: 1, status: 'PENDING' });

    // then
    expect(response.status()).toBe(200);
    const page: OrderPageDto = await response.json();
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(1);
    expect(page.content).toHaveLength(1);
    expect(page.content[0]).toMatchObject({ id: expect.any(Number), status: 'PENDING' });
    // Other tests may own the first row; global totals and membership are not stable.
  });

  test('rejects a negative page index - 400', async ({ api }) => {
    // given
    const client = await api.adminOrders();

    // when
    const response = await client.getAll({ page: -1 });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Page index must not be less than zero' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OrdersClient(request).getAll();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('denies a client - 403', async ({ orders }) => {
    // when
    const response = await orders.client.getAll();

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
  });
});
