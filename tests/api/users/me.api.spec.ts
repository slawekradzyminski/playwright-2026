import { test, expect } from '../../../fixtures/loggedInUser.fixture';
import { SessionClient } from '../../../http/sessionClient';
import { expectJson, expectError } from '../../../validators/jsonResponse';

let client: SessionClient;
test.beforeEach(({ request }) => { client = new SessionClient(request); });

test('200 - resolve the signed-in customer identity without exposing secrets', async ({ loggedInUser }) => {
  // given
  const { user, token } = loggedInUser;

  // when
  const response = await client.me(token);

  // then
  const body = await expectJson(response, 200);
  expect(body).toEqual({ id: expect.any(Number), username: user.username, email: user.email,
    firstName: user.firstName, lastName: user.lastName, roles: ['ROLE_CLIENT'] });
  expect(body.id).toBeGreaterThan(0);
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous identity lookup', async () => {
  // given
  const token = undefined;

  // when
  const response = await client.me(token);

  // then
  await expectError(response, 401, 'Unauthorized');
});
