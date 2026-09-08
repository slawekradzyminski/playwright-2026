import { test, expect } from '../../../fixtures/accounts.fixture';
import { UserClient } from '../../../http/userClient';
import { expectError } from '../../../validators/jsonResponse';

let client: UserClient;
test.beforeEach(({ request }) => { client = new UserClient(request); });

test('204 - allow an admin to delete a customer account', async ({ adminToken, accountFactory }) => {
  // given
  const account = await accountFactory.create();

  // when
  const response = await client.deleteUser(account.user.username, adminToken);

  // then
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe('');
  await expectError(await client.getUser(account.user.username, adminToken), 404, "The user doesn't exist");
});

test('401 - reject anonymous account deletion', async ({ accountFactory }) => {
  // given
  const account = await accountFactory.create();

  // when
  const response = await client.deleteUser(account.user.username);

  // then
  await expectError(response, 401, 'Unauthorized');
  expect((await client.getUser(account.user.username, account.token)).status()).toBe(200);
});

test('403 - reject a customer deleting another account', async ({ accountFactory, loggedInUser }) => {
  // given
  const account = await accountFactory.create();

  // when
  const response = await client.deleteUser(account.user.username, loggedInUser.token);

  // then
  await expectError(response, 403, 'Access denied');
  expect((await client.getUser(account.user.username, account.token)).status()).toBe(200);
});

test('404 - report a missing account deletion', async ({ adminToken }) => {
  // given
  const username = `missing-delete-${Date.now()}`;

  // when
  const response = await client.deleteUser(username, adminToken);

  // then
  await expectError(response, 404, "The user doesn't exist");
});
