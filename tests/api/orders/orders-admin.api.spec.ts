import { test, expect } from '../../../fixtures/orders.fixture';
import { OrderClient } from '../../../http/orderClient';
import { expectOrderPage } from '../../../validators/orderResponse';
import { expectJson, expectError } from '../../../validators/jsonResponse';
import type { OrderDto } from '../../../types/order';

let client: OrderClient;
test.beforeEach(({ request }) => { client = new OrderClient(request); });

for (const status of [undefined, 'PAID'] as const) {
  test(`200 - admin paginates ${status ?? 'all'} orders across owners`, async ({ orderSetup, adminToken }) => {
    // given
    const owned = [await orderSetup.createOrder(), await orderSetup.createOrder(orderSetup.other)];
    for (const order of owned) expect((await client.updateStatus(order.id, 'PAID', adminToken)).status()).toBe(200);
    const pending = await orderSetup.createOrder();

    // when
    const scanOrders = async () => {
      const first = await expectOrderPage(await client.listAdmin({ status, page: 0, size: 1 }, adminToken), 0, 1);
      const found: OrderDto[] = [...first.content];
      for (let page = 1; page < first.totalPages; page++) {
        found.push(...(await expectOrderPage(await client.listAdmin({ status, page, size: 1 }, adminToken), page, 1)).content);
      }
      if (status) {
        expect(found.every(order => order.status === status)).toBe(true);
        expect(found.map(order => order.id)).not.toContain(pending.id);
      }
      return found;
    };

    // then
    // Parallel fixture cleanup shifts global page offsets. Retry from page zero,
    // retaining no results between scans; one scan must contain every owned order.
    await expect.poll(scanOrders, {
      message: 'Admin pagination includes orders from both owners in one complete scan',
      timeout: 10_000,
      intervals: [100, 250, 500],
    }).toEqual(expect.arrayContaining([
      ...owned.map(order => expect.objectContaining({
        id: order.id, username: order.username, status: 'PAID', totalAmount: order.totalAmount, items: order.items,
      })),
      ...(status ? [] : [pending]),
    ]));
  });
}

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('400 - reject invalid admin status filter', async ({ adminToken }) => {
  // given
  const query = { status: 'BOGUS' };

  // when
  const response = await client.listAdmin(query, adminToken);

  // then
  expect(await expectJson(response, 400)).toEqual({ error: 'No enum constant com.awesome.testing.dto.order.OrderStatus.BOGUS' });
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous admin listing', async () => {
  // given
  const query = {};

  // when
  const response = await client.listAdmin(query);

  // then
  await expectError(response, 401, 'Unauthorized');
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('403 - deny customer access to all orders', async ({ loggedInUser }) => {
  // given
  const token = loggedInUser.token;

  // when
  const response = await client.listAdmin({}, token);

  // then
  await expectError(response, 403, 'Access denied');
});
