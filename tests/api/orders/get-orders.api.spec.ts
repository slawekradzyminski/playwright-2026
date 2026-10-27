import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';
import type { OrderPageDto } from '../../../types/order';

test.describe('GET /api/v1/orders', () => {
  test('paginates and filters only the caller orders - 200', async ({ orders }) => {
    // given
    const { order } = await orders.placeOrder();

    // when
    const response = await orders.client.getMine({ page: 0, size: 1, status: 'PENDING' });

    // then
    expect(response.status()).toBe(200);
    const page: OrderPageDto = await response.json();
    expect(page).toEqual({ pageNumber: 0, pageSize: 1, totalElements: 1, totalPages: 1, content: [order] });
    const excluded = await orders.client.getMine({ status: 'CANCELLED' });
    expect(excluded.status()).toBe(200);
    expect((await excluded.json() as OrderPageDto).content).toEqual([]);
  });

  test('rejects a negative page index - 400', async ({ orders }) => {
    // when
    const response = await orders.client.getMine({ page: -1 });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Page index must not be less than zero' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OrdersClient(request).getMine();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
