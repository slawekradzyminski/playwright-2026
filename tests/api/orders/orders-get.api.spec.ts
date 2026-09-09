import { test, expect } from '../../../fixtures/orders.fixture';
import { OrderClient } from '../../../http/orderClient';
import { expectOrderPageContents, expectPaginatedOrders } from '../../../validators/orderResponse';
import { expectJson, expectError } from '../../../validators/jsonResponse';

let client: OrderClient;
test.beforeEach(({ request }) => { client = new OrderClient(request); });

test('200 - list only owner orders with pagination and status filtering', async ({ orderSetup, adminToken }) => {
  // given
  const first = await orderSetup.createOrder();
  const paid = await orderSetup.createOrder();
  const foreign = await orderSetup.createOrder(orderSetup.other);
  expect((await client.updateStatus(paid.id, 'PAID', adminToken)).status()).toBe(200);
  const token = orderSetup.owner.token;

  // when
  const all = await client.list({}, token);
  const pages = [await client.list({ page: 0, size: 1 }, token), await client.list({ page: 1, size: 1 }, token)];
  const filtered = await client.list({ status: 'PAID' }, token);
  const other = await client.list({}, orderSetup.other.token);

  // then
  const ownerOrders = [
    { id: first.id, username: first.username },
    { id: paid.id, username: paid.username, status: 'PAID' as const }
  ];
  await expectOrderPageContents(all, { page: 0, size: 10, orders: ownerOrders });
  await expectPaginatedOrders(pages, 1, ownerOrders);
  await expectOrderPageContents(filtered, { page: 0, size: 10, orders: [ownerOrders[1]] });
  await expectOrderPageContents(other, { page: 0, size: 10, orders: [foreign], exact: true });
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('400 - reject invalid status filter', async ({ loggedInUser }) => {
  // given
  const query = { status: 'BOGUS' };

  // when
  const response = await client.list(query, loggedInUser.token);

  // then
  expect(await expectJson(response, 400)).toEqual({ error: 'No enum constant com.awesome.testing.dto.order.OrderStatus.BOGUS' });
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous order listing', async () => {
  // given
  const query = {};

  // when
  const response = await client.list(query);

  // then
  await expectError(response, 401, 'Unauthorized');
});
