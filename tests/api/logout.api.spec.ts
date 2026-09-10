import { expect } from '@playwright/test';
import { test } from '../../fixtures/authenticated-user-fixture';
import { LogoutClient } from '../../clients/logout-client';
import { RefreshClient } from '../../clients/refresh-client';
import { LoginClient } from '../../clients/login-client';
import { unauthorizedCases } from './test-data/unauthorized-cases';

test.describe('POST /api/v1/users/logout', () => {
  let client: LogoutClient;
  let refreshClient: RefreshClient;
  let loginClient: LoginClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new LogoutClient(request);
    refreshClient = new RefreshClient(request);
    loginClient = new LoginClient(request);
  });

  test('should revoke refresh tokens from every session - 200', async ({ authenticatedUser }) => {
    // given
    const { token, refreshToken, user } = authenticatedUser;
    const secondLogin = await loginClient.login({ username: user.username, password: user.password });
    expect(secondLogin.status()).toBe(200);
    const secondSession = await secondLogin.json();
    expect(secondSession.refreshToken).toEqual(expect.stringMatching(/\S+/));
    expect(secondSession.refreshToken).not.toBe(refreshToken);

    // when
    const response = await client.logout(token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe('');
    for (const value of [refreshToken, secondSession.refreshToken]) {
      const refresh = await refreshClient.refresh(value);
      expect(refresh.status()).toBe(401);
      expect(await refresh.json()).toEqual({ message: 'Invalid refresh token' });
    }
    const newLogin = await loginClient.login({ username: user.username, password: user.password });
    expect(newLogin.status()).toBe(200);
    const newSession = await newLogin.json();
    expect((await refreshClient.refresh(newSession.refreshToken)).status()).toBe(200);
  });

  test('should reject unauthorized requests - 401', async ({ authenticatedUser }) => {
    // given
    const cases = unauthorizedCases(authenticatedUser.token);

    for (const { name, token, message } of cases) {
      await test.step(name, async () => {
        // when
        const response = await client.logout(token);

        // then
        expect.soft(response.status()).toBe(401);
        expect.soft(await response.json()).toEqual({ message });
      });
    }
    const refresh = await refreshClient.refresh(authenticatedUser.refreshToken);
    expect(refresh.status(), 'Unauthorized logout must not revoke the session').toBe(200);
  });
});
