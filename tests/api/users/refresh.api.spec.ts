import { test, expect } from '../../../fixtures/loggedInUser.fixture';
import { SessionClient } from '../../../http/sessionClient';
import { expectJson, expectError } from '../../../validators/jsonResponse';
import { expectValidJwt } from '../../../validators/jwt';
import { expectValidOpaqueToken } from '../../../validators/authResponse';

let client: SessionClient;
test.beforeEach(({ request }) => { client = new SessionClient(request); });

test('200 - rotate refresh token and accept the new access token at me', async ({ loggedInUser }) => {
  // given
  const { refreshToken, user } = loggedInUser;

  // when
  const response = await client.refresh({ refreshToken });

  // then
  const body = await expectJson<{ token: string; refreshToken: string }>(response, 200);
  expectValidJwt(body.token);
  expectValidOpaqueToken(body.refreshToken, 'refreshToken');
  expect(body.refreshToken).not.toBe(refreshToken);
  expect(await expectJson(await client.me(body.token), 200)).toMatchObject({
    username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, roles: ['ROLE_CLIENT']
  });
});

// BUG-010: error schema differs from success DTO; ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
test('400 - reject a blank refresh token', async () => {
  // given
  const payload = { refreshToken: '' };

  // when
  const response = await client.refresh(payload);

  // then
  expect(await expectJson(response, 400)).toEqual({ refreshToken: 'must not be blank' });
});

// BUG-010: ../../../reports/bugs/BUG-010-auth-orders-error-contract.md.
for (const scenario of ['replayed', 'unknown'] as const) {
  test(`401 - reject ${scenario} refresh token`, async ({ loggedInUser }) => {
    // given
    const refreshToken = scenario === 'replayed' ? loggedInUser.refreshToken : 'does-not-exist';
    if (scenario === 'replayed') expect((await client.refresh({ refreshToken })).status()).toBe(200);

    // when
    const response = await client.refresh({ refreshToken });

    // then
    await expectError(response, 401, 'Invalid refresh token');
  });
}
