import { expect } from '@playwright/test';
import { test } from '../../../fixtures/authenticated-user-fixture';
import { RefreshClient } from '../../../clients/users/refresh-client';
import { CurrentUserClient } from '../../../clients/users/current-user-client';
import { expectLoginJwt } from '../../../validators/jwt-validator';
import { expectRegisteredUser } from '../../../validators/user-response-validator';

test.describe('POST /api/v1/users/refresh', () => {
  let client: RefreshClient;
  let currentUserClient: CurrentUserClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new RefreshClient(request);
    currentUserClient = new CurrentUserClient(request);
  });

  test('should rotate tokens without requiring an access token - 200', async ({ authenticatedUser }) => {
    // given
    const { refreshToken, user } = authenticatedUser;

    // when
    const response = await client.refresh(refreshToken);

    // then
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ token: expect.any(String), refreshToken: expect.stringMatching(/\S+/) });
    expect(body.refreshToken).not.toBe(refreshToken);
    expectLoginJwt(body.token, user.username, ['ROLE_CLIENT']);
    const identity = await currentUserClient.getMe(body.token);
    expect(identity.status()).toBe(200);
    expectRegisteredUser(await identity.json(), user);
    const replacement = await client.refresh(body.refreshToken);
    expect(replacement.status()).toBe(200);
    const next = await replacement.json();
    expect(next.refreshToken).toEqual(expect.stringMatching(/\S+/));
    expect(next.refreshToken).not.toBe(body.refreshToken);
    expectLoginJwt(next.token, user.username, ['ROLE_CLIENT']);
  });

  const invalidBodies = [
    { name: 'missing refresh token', data: {} },
    { name: 'null refresh token', data: { refreshToken: null } },
    { name: 'empty refresh token', data: { refreshToken: '' } },
    { name: 'blank refresh token', data: { refreshToken: ' ' } },
  ];

  for (const { name, data } of invalidBodies) {
    test(`should reject ${name} - 400`, async () => {
      // given
      const payload = data;

      // when
      const response = await client.refreshRaw(payload);

      // then
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ refreshToken: 'must not be blank' });
    });
  }

  test('should reject invalid, wrong-type and consumed tokens - 401', async ({ authenticatedUser }) => {
    // given
    const { refreshToken, token } = authenticatedUser;
    expect((await client.refresh(refreshToken)).status()).toBe(200);
    const cases = [
      { name: 'unknown token', value: 'invalid' },
      { name: 'access token used as refresh token', value: token },
      { name: 'already consumed token', value: refreshToken },
    ];

    for (const { name, value } of cases) {
      await test.step(name, async () => {
        // when
        const response = await client.refresh(value);

        // then
        expect.soft(response.status()).toBe(401);
        expect.soft(await response.json()).toEqual({ message: 'Invalid refresh token' });
      });
    }
  });
});
