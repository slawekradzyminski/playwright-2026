import { test, expect } from '../../../fixtures/loggedInUser.fixture';
import { SessionClient } from '../../../http/sessionClient';
import { LoginClient } from '../../../http/loginClient';
import { expectError } from '../../../validators/jsonResponse';
import { expectValidLoginResponse } from '../../../validators/authResponse';

let client: SessionClient;
let login: LoginClient;
test.beforeEach(({ request }) => {
  client = new SessionClient(request);
  login = new LoginClient(request);
});

test('200 - logout revokes all disposable customer sessions', async ({ loggedInUser }) => {
  // given
  const secondResponse = await login.signIn(loggedInUser.user);
  expect(secondResponse.status()).toBe(200);
  const second = await expectValidLoginResponse(secondResponse, loggedInUser.user.username);

  // when
  const response = await client.logout(loggedInUser.token);

  // then
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe('');
  for (const refreshToken of [loggedInUser.refreshToken, second.refreshToken]) {
    await expectError(await client.refresh({ refreshToken }), 401, 'Invalid refresh token');
  }
});

test('401 - reject anonymous logout', async () => {
  // given
  const token = undefined;

  // when
  const response = await client.logout(token);

  // then
  await expectError(response, 401, 'Unauthorized');
});
