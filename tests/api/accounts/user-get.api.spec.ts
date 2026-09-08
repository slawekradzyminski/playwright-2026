import { test, expect } from '../../../fixtures/accounts.fixture';
import { UserClient } from '../../../http/userClient';
import { expectAccount } from '../../../validators/accountResponse';
import { expectError } from '../../../validators/jsonResponse';

let client: UserClient;
test.beforeEach(({ request }) => { client = new UserClient(request); });

test('200 - return the requested customer public account details', async ({ loggedInUser }) => {
  // given
  const { user, token } = loggedInUser;

  // when
  const response = await client.getUser(user.username, token);

  // then
  expect(await expectAccount(response)).toMatchObject({ username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, roles: ['ROLE_CLIENT'] });
});

// BUG-020: ../../../reports/bugs/BUG-020-user-read-error-schemas.md.
test('401 - reject anonymous account lookup', async ({ loggedInUser }) => {
  // given
  const token = undefined;

  // when
  const response = await client.getUser(loggedInUser.user.username, token);

  // then
  await expectError(response, 401, 'Unauthorized');
});

test('404 - report a missing account to an authenticated caller', async ({ adminToken }) => {
  // given
  const username = `missing-account-${Date.now()}`;

  // when
  const response = await client.getUser(username, adminToken);

  // then
  await expectError(response, 404, "The user doesn't exist");
});

