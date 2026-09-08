import { test, expect } from '../../../fixtures/accounts.fixture';
import { UserClient } from '../../../http/userClient';
import { expectAccountList } from '../../../validators/accountResponse';
import { expectError } from '../../../validators/jsonResponse';

let client: UserClient;
test.beforeEach(({ request }) => { client = new UserClient(request); });

test('200 - list public account details for an authenticated admin', async ({ adminToken, loggedInUser }) => {
  // given
  const expectedUsername = loggedInUser.user.username;

  // when
  const response = await client.getUsers(adminToken);

  // then
  const body = await expectAccountList(response);
  expect(body.some(account => account.username === expectedUsername)).toBe(true);
  expect(body.every(account => !('password' in account))).toBe(true);
});

// BUG-020: ../../../reports/bugs/BUG-020-user-read-error-schemas.md.
test('401 - reject anonymous account listing', async () => {
  // given
  const token = undefined;

  // when
  const response = await client.getUsers(token);

  // then
  await expectError(response, 401, 'Unauthorized');
});

