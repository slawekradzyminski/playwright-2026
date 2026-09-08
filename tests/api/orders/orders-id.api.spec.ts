import { test, expect, shippingAddress, missingOrderId } from '../../../fixtures/orders.fixture';
import { OrderClient } from '../../../http/orderClient';
import { expectOrder } from '../../../validators/orderResponse';
import { expectJson, expectError } from '../../../validators/jsonResponse';

let client: OrderClient;
test.beforeEach(({ request }) => { client = new OrderClient(request); });

for (const role of ['owner', 'admin'] as const) {
  test(`200 - ${role} reads the persisted order`, async ({ orderSetup, adminToken }) => {
    // given
    const order = await orderSetup.createOrder();
    const token = role === 'admin' ? adminToken : orderSetup.owner.token;

    // when
    const response = await client.get(order.id, token);

    // then
    expect(await expectOrder(response, orderSetup.owner.user.username, orderSetup.products, shippingAddress)).toEqual(order);
  });
}

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('400 - reject a malformed order ID', async ({ loggedInUser }) => {
  // given
  const id = 'bad-id';

  // when
  const response = await client.get(id, loggedInUser.token);

  // then
  expect(await expectJson(response, 400)).toEqual({ error: 'For input string: "bad-id"' });
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous order read', async () => {
  // given
  const id = missingOrderId;

  // when
  const response = await client.get(id);

  // then
  await expectError(response, 401, 'Unauthorized');
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
for (const scenario of ['missing', 'another customer’s'] as const) {
  test(`404 - conceal ${scenario} order`, async ({ orderSetup }) => {
    // given
    const order = await orderSetup.createOrder();
    const id = scenario === 'missing' ? missingOrderId : order.id;

    // when
    const response = await client.get(id, orderSetup.other.token);

    // then
    await expectError(response, 404, 'Order not found');
    expect(await expectOrder(await client.get(order.id, orderSetup.owner.token), orderSetup.owner.user.username, orderSetup.products, shippingAddress)).toEqual(order);
  });
}
