import { expect } from '@playwright/test';
import { test } from '../../../fixtures/api/commerce';
import { unauthorizedCases } from '../test-data/unauthorized-cases';
import { GetOrderClient } from '../../../clients/orders/get-order-client';

test.describe('GET /api/v1/orders/{id}', () => {
  let detail: GetOrderClient;

  test.beforeEach(async ({ request }) => {
    // given
    detail = new GetOrderClient(request);
  });

  test('should return the complete order to its owner - 200', async ({ commerce, order }) => {
    // given
    const id = order.id;

    // when
    const response = await detail.get(id, commerce.user.token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(order);
  });

  test('should let an admin read a clients order - 200', async ({ order, adminToken }) => {
    // given
    const id = order.id;

    // when
    const response = await detail.get(id, adminToken);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(order);
  });

  test('should reject a nonnumeric order identifier - 400', async ({ commerce }) => {
    // given
    const id = 'abc';

    // when
    const response = await detail.get(id, commerce.user.token);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'For input string: "abc"' });
  });

  test('should reject missing, invalid and tampered credentials - 401', async ({ commerce, order }) => {
    // given
    const token = commerce.user.token;
    for (const { name, token: rejectedToken, message } of unauthorizedCases(token)) {
      await test.step(name, async () => {
        // when
        const response = await detail.get(order.id, rejectedToken);

        // then
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ message });
      });
    }
  });

  test('should hide another users order - 404', async ({ commerce, order }) => {
    // given
    const id = order.id;

    // when
    const response = await detail.get(id, commerce.other.token);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Order not found' });
  });

  test('should return not found for a missing order - 404', async ({ commerce }) => {
    // given
    const id = -1;

    // when
    const response = await detail.get(id, commerce.user.token);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Order not found' });
  });
});
