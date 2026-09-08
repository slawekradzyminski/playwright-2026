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

// BUG-013: updatedAt equality excluded; ../../../reports/bugs/BUG-013-order-mutation-stale-updated-at.md.
test('200 - admin progresses PAID to SHIPPED to DELIVERED without further stock changes', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();

  for (const status of ['PAID', 'SHIPPED', 'DELIVERED'] as const) {
    // when
    const response = await client.updateStatus(order.id, status, adminToken);

    // then
    const updated = await expectOrder(response, order.username, orderSetup.products, shippingAddress, status);
    expect(updated.id).toBe(order.id);
    expectPersistedOrder(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, status), updated);
    await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);
  }
});

// BUG-013: updatedAt equality excluded; ../../../reports/bugs/BUG-013-order-mutation-stale-updated-at.md.
test('200 - admin status cancellation persists and restores inventory', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();
  await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);

  // when
  const response = await client.updateStatus(order.id, 'CANCELLED', adminToken);

  // then
  const updated = await expectOrder(response, order.username, orderSetup.products, shippingAddress, 'CANCELLED');
  expect(updated.id).toBe(order.id);
  expectPersistedOrder(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, 'CANCELLED'), updated);
  await expectStocks(catalog, orderSetup.products, adminToken, [20, 20]);
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('400 - admin cannot cancel a delivered order through status update', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();
  expect((await client.updateStatus(order.id, 'DELIVERED', adminToken)).status()).toBe(200);
  const before = await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, 'DELIVERED');

  // when
  const response = await client.updateStatus(order.id, 'CANCELLED', adminToken);

  // then
  await expectError(response, 400, 'Order cannot be cancelled in current status');
  expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress, 'DELIVERED')).toEqual(before);
  await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous status change', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();

  // when
  const response = await client.updateStatus(order.id, 'PAID');

  // then
  await expectError(response, 401, 'Unauthorized');
  expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress)).toEqual(order);
  await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('403 - owner cannot grant its own order a paid status', async ({ orderSetup, adminToken }) => {
  // given
  const order = await orderSetup.createOrder();

  // when
  const response = await client.updateStatus(order.id, 'PAID', orderSetup.owner.token);

  // then
  await expectError(response, 403, 'Access denied');
  expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), order.username, orderSetup.products, shippingAddress)).toEqual(order);
  await expectStocks(catalog, orderSetup.products, adminToken, [18, 17]);
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('404 - reject admin status update for missing order', async ({ adminToken }) => {
  // given
  const id = missingOrderId;

  // when
  const response = await client.updateStatus(id, 'PAID', adminToken);

  // then
  await expectError(response, 404, 'Order not found');
});
