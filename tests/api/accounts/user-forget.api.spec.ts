import { test, expect } from '../../../fixtures/accounts.fixture';
import { UserClient } from '../../../http/userClient';
import { CartClient } from '../../../http/cartClient';
import { OrderClient } from '../../../http/orderClient';
import { SignupClient } from '../../../http/signupClient';
import { LoginClient } from '../../../http/loginClient';
import { SessionClient } from '../../../http/sessionClient';
import { expectValidLoginResponse } from '../../../validators/authResponse';
import { expectError, expectJson } from '../../../validators/jsonResponse';

let client: UserClient;
test.beforeEach(({ request }) => { client = new UserClient(request); });

test('204 - forget a customer account and its owned cart and order data', async ({ request, adminToken, accountFactory, productFactory }) => {
  // given
  const account = await accountFactory.create();
  const product = await productFactory.create({ stockQuantity: 10 });
  await expect((await new CartClient(request).addItem({ productId: product.id, quantity: 1 }, account.token)).status()).toBe(200);
  const orderResponse = await new OrderClient(request).create({ street: 'Owned Street', city: 'Warsaw', state: 'Mazovia', zipCode: '00-001', country: 'PL' }, account.token);
  const order = await expectJson<{ id: number }>(orderResponse, 201);
  // Checkout clears the cart: refill it so deletion actually exercises cart cleanup.
  expect((await new CartClient(request).addItem({ productId: product.id, quantity: 2 }, account.token)).status()).toBe(200);

  // when
  const response = await client.deleteRightToBeForgotten(account.user.username, account.token);

  // then
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe('');
  await expectError(await client.getUser(account.user.username, adminToken), 404, "The user doesn't exist");
  await expectError(await new OrderClient(request).get(order.id, adminToken), 404, 'Order not found');
  await expectError(await new SessionClient(request).refresh({ refreshToken: account.refreshToken }), 401, 'Invalid refresh token');
  // BUG-022 prevents using the old JWT to inspect the cart. Recreating this owned
  // username verifies that username-linked cart/order rows were actually removed.
  expect((await new SignupClient(request).signUp(account.user)).status()).toBe(201);
  const recreated = await expectValidLoginResponse(await new LoginClient(request).signIn({
    username: account.user.username, password: account.user.password
  }), account.user.username);
  expect((await expectJson(await new CartClient(request).getCart(recreated.token), 200)).items).toEqual([]);
  expect((await expectJson(await new OrderClient(request).list({}, recreated.token), 200)).totalElements).toBe(0);
});

test('204 - allow an admin to forget another customer account', async ({ adminToken, accountFactory }) => {
  // given
  const account = await accountFactory.create();

  // when
  const response = await client.deleteRightToBeForgotten(account.user.username, adminToken);

  // then
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe('');
  await expectError(await client.getUser(account.user.username, adminToken), 404, "The user doesn't exist");
});

test('401 - reject anonymous right-to-be-forgotten request', async ({ accountFactory }) => {
  // given
  const account = await accountFactory.create();

  // when
  const response = await client.deleteRightToBeForgotten(account.user.username);

  // then
  await expectError(response, 401, 'Unauthorized');
  expect((await client.getUser(account.user.username, account.token)).status()).toBe(200);
});

test('403 - reject a customer forgetting another account', async ({ accountFactory, loggedInUser }) => {
  // given
  const account = await accountFactory.create();

  // when
  const response = await client.deleteRightToBeForgotten(account.user.username, loggedInUser.token);

  // then
  await expectError(response, 403, 'Access denied');
  expect((await client.getUser(account.user.username, account.token)).status()).toBe(200);
});

test('404 - report a missing right-to-be-forgotten target', async ({ adminToken }) => {
  // given
  const username = `missing-forget-${Date.now()}`;

  // when
  const response = await client.deleteRightToBeForgotten(username, adminToken);

  // then
  await expectError(response, 404, "The user doesn't exist");
});
