import { test, expect } from '@playwright/test';
import { AuthClient } from '../../http/auth-client';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../test-config';
import type { LoginDto } from '../../types/auth';

const validCredentials: LoginDto = {
  username: ADMIN_USERNAME,
  password: ADMIN_PASSWORD,
};

test.describe('/api/v1/users/signin', () => {
  let authClient: AuthClient;

  test.beforeEach(async ({ request }) => {
    authClient = new AuthClient(request);
  });

  test('successfully authenticates with valid credentials - 200', async () => {
    // when
    const response = await authClient.login(validCredentials);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^application\/json\b/);
    expectSuccessfulLogin(await response.json());
  });

  test('returns validation errors for empty credentials - 400', async () => {
    // given
    const wrongCredentials: LoginDto = { username: '', password: '' };

    // when
    const response = await authClient.login(wrongCredentials);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      username: 'Minimum username length: 4 characters',
      password: 'Minimum password length: 4 characters',
    });
  });
  
  test('rejects an invalid Bearer token even with valid credentials - 401', async () => {
    // when
    const response = await authClient.login(validCredentials, {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid or expired token' });
  });

  test('rejects invalid credentials - 422', async () => {
    // given
    const wrongCredentials: LoginDto = { username: 'nonexistent-login-user', password: 'invalid-password' };

    // when
    const response = await authClient.login(wrongCredentials);

    // then
    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({
      message: 'Invalid username/password supplied',
    });
  });
  
});

function expectSuccessfulLogin(body: unknown) {
  expect(body).toMatchObject({
    token: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
    refreshToken: expect.stringMatching(/\S+/),
    username: validCredentials.username,
    email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    roles: expect.any(Array),
    mfaRequired: false,
    challengeToken: null,
    challengeExpiresAt: null,
  });
}
