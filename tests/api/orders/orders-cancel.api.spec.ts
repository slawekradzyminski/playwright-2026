import { test, expect, shippingAddress, missingOrderId } from '../../../fixtures/orders.fixture';
import { OrderClient } from '../../../http/orderClient';
import { ProductClient } from '../../../http/productClient';
import { expectOrder, expectPersistedOrder } from '../../../validators/orderResponse';
import { expectError } from '../../../validators/jsonResponse';
import { expectStocks } from './order-helpers';

let client: OrderClient;
let catalog: ProductClient;
test.beforeEach(({ request }) => {
  client = new OrderClient(request);
  catalog = new ProductClient(request);
});

// BUG-013: updatedAt equality excluded; ../../../reports/bugs/[L][F]-BUG-013-order-mutation-stale-updated-at.md.
for (const scenario of [
  { role: 'owner', status: 'PENDING' },
  { role: 'owner', status: 'PAID' },
  { role: 'admin', status: 'PENDING' }
] as const) {
  test(`200 - ${scenario.role} cancels ${scenario.status} order and restores both stocks`, async ({ orderSetup, adminToken }) => {
    // given
    const order = await orderSetup.createOrder();
    if (scenario.status === 'PAID') expect((await client.updateStatus(order.id, 'PAID', adminToken)).status()).toBe(200);
    const token = scenario.role === 'admin' ? adminToken : orderSetup.owner.token;
    await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);

    // when
    const response = await client.cancel(order.id, token);

    // then
    const cancelled = await expectOrder(response, order.username, orderSetup.products, shippingAddress, 'CANCELLED');
    expect(cancelled.id).toBe(order.id);
    expectPersistedOrder(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, 'CANCELLED'), cancelled);
    await expectStocks(catalog, orderSetup.products, adminToken, [20, 20]);
  });
}

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
for (const status of ['CANCELLED', 'SHIPPED', 'DELIVERED'] as const) {
  test(`400 - cannot cancel ${status} order or restore stock again`, async ({ orderSetup, adminToken }) => {
    // given
    const order = await orderSetup.createOrder();
    expect((await client.updateStatus(order.id, status, adminToken)).status()).toBe(200);
    const before = await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, status);

    // when
    const response = await client.cancel(order.id, orderSetup.owner.token);

    // then
    await expectError(response, 400, 'Order cannot be cancelled in current status');
    expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, status)).toEqual(before);
    await expectStocks(catalog, orderSetup.products, adminToken, status === 'CANCELLED' ? [20, 20] : [18, 17]);
  });
}

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous cancellation', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();

  // when
  const response = await client.cancel(order.id);

  // then
  await expectError(response, 401, 'Unauthorized');
  expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress)).toEqual(order);
  await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('403 - customer B cannot cancel customer A’s order or restore stock', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();

  // when
  const response = await client.cancel(order.id, orderSetup.other.token);

  // then
  await expectError(response, 403, "You cannot cancel someone else's order");
  expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress)).toEqual(order);
  await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('404 - reject cancellation of missing order', async ({ loggedInUser }) => {
  // given
  const id = missingOrderId;

  // when
  const response = await client.cancel(id, loggedInUser.token);

  // then
  await expectError(response, 404, 'Order not found');
});
