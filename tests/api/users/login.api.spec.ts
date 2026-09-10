import { test, expect } from '@playwright/test';
import { LoginClient } from '../../../clients/users/login-client';
import { expectSuccessfulLogin } from '../../../validators/login-response-validator';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../../test-config';

const validCredentials = { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };

test.describe('/api/v1/users/signin API tests', () => {
  let loginClient: LoginClient;

  test.beforeEach(async ({ request }) => {
    // given
    loginClient = new LoginClient(request);
  });

  test('should successfully authenticate with valid credentials - 200', async () => {
    // when
    const response = await loginClient.login(validCredentials);

    // then
    expect(response.status()).toBe(200);
    expectSuccessfulLogin(await response.json(), validCredentials.username);
  });

  const validationCases = [
    { name: 'empty username', credentials: { ...validCredentials, username: '' }, field: 'username' },
    { name: 'username too short', credentials: { ...validCredentials, username: 'abc' }, field: 'username' },
    { name: 'password too short', credentials: { ...validCredentials, password: 'abc' }, field: 'password' },
  ] as const;

  for (const { name, credentials, field } of validationCases) {
    test(`should return validation error for ${name} - 400`, async () => {
      // when
      const response = await loginClient.login(credentials);

      // then
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({
        [field]: `Minimum ${field} length: 4 characters`,
      });
    });
  }

  test('should return authentication error for both invalid credentials - 422', async () => {
    // when
    const response = await loginClient.login({
      username: 'wronguser',
      password: 'wrongpassword',
    });

    // then
    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({ message: 'Invalid username/password supplied' });
  });
});
