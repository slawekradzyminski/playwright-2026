import { test, expect } from '../../../fixtures/accounts.fixture';
import { UserClient } from '../../../http/userClient';
import { expectAccount } from '../../../validators/accountResponse';
import { expectError, expectJson } from '../../../validators/jsonResponse';
import type { AccountEdit } from '../../../types/account';

let client: UserClient;
test.beforeEach(({ request }) => { client = new UserClient(request); });

const editFor = (username: string): AccountEdit => ({ email: `${username}-updated@example.test`, firstName: 'UpdatedFirst', lastName: 'UpdatedLast' });

test('200 - allow a customer to edit their own profile', async ({ loggedInUser }) => {
  // given
  const { user, token } = loggedInUser;
  const validEdit = editFor(user.username);

  // when
  const response = await client.updateUser(user.username, validEdit, token);

  // then
  const body = await expectAccount(response);
  expect(body).toMatchObject({ username: user.username, ...validEdit, roles: ['ROLE_CLIENT'] });
  const persisted = await client.getUser(user.username, token);
  expect(await expectJson(persisted, 200)).toMatchObject({ username: user.username, ...validEdit });
});

test('200 - allow an admin to edit another customer profile', async ({ adminToken, accountFactory }) => {
  // given
  const account = await accountFactory.create();
  const validEdit = editFor(account.user.username);

  // when
  const response = await client.updateUser(account.user.username, validEdit, adminToken);

  // then
  expect(await expectAccount(response)).toMatchObject({ username: account.user.username, ...validEdit, roles: ['ROLE_CLIENT'] });
  expect(await expectAccount(await client.getUser(account.user.username, adminToken))).toMatchObject(validEdit);
});

// BUG-021: ../../../reports/bugs/[M][D]-BUG-021-user-edit-error-schemas.md.
test('400 - reject an invalid profile edit', async ({ adminToken, loggedInUser }) => {
  // given
  const invalidEdit = { email: '', firstName: 'abc', lastName: 'abc' };

  // when
  const response = await client.updateUser(loggedInUser.user.username, invalidEdit, adminToken);

  // then
  const body = await expectJson<Record<string, string>>(response, 400);
  expect(body).toMatchObject({ email: 'Email is required', firstName: expect.any(String), lastName: expect.any(String) });
  expect(await expectAccount(await client.getUser(loggedInUser.user.username, adminToken))).toMatchObject({ email: loggedInUser.user.email, firstName: loggedInUser.user.firstName, lastName: loggedInUser.user.lastName });
});

// BUG-021: ../../../reports/bugs/[M][D]-BUG-021-user-edit-error-schemas.md.
test('401 - reject an anonymous profile edit', async ({ loggedInUser }) => {
  // given
  const token = undefined;
  const validEdit = editFor(loggedInUser.user.username);

  // when
  const response = await client.updateUser(loggedInUser.user.username, validEdit, token);

  // then
  await expectError(response, 401, 'Unauthorized');
  expect(await expectAccount(await client.getUser(loggedInUser.user.username, loggedInUser.token))).toMatchObject({ email: loggedInUser.user.email, firstName: loggedInUser.user.firstName, lastName: loggedInUser.user.lastName });
});

// BUG-021: ../../../reports/bugs/[M][D]-BUG-021-user-edit-error-schemas.md.
test('403 - reject a customer editing another account', async ({ accountFactory, loggedInUser }) => {
  // given
  const target = await accountFactory.create();
  const validEdit = editFor(target.user.username);

  // when
  const response = await client.updateUser(target.user.username, validEdit, loggedInUser.token);

  // then
  await expectError(response, 403, 'Access denied');
  expect(await expectAccount(await client.getUser(target.user.username, target.token))).toMatchObject({ email: target.user.email, firstName: target.user.firstName, lastName: target.user.lastName });
});

// BUG-021: ../../../reports/bugs/[M][D]-BUG-021-user-edit-error-schemas.md.
test('404 - report a missing account edit', async ({ adminToken }) => {
  // given
  const username = `missing-edit-${Date.now()}`;
  const validEdit = editFor(username);

  // when
  const response = await client.updateUser(username, validEdit, adminToken);

  // then
  await expectError(response, 404, "The user doesn't exist");
});

