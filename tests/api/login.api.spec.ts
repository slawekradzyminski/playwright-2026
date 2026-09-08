import { expectJson } from '../../validators/jsonResponse';
import { expect, test } from '@playwright/test';
import type { LoginDto } from '../../types/auth';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../test-config';
import { LoginClient } from '../../http/loginClient';
import { expectValidLoginResponse } from '../../validators/authResponse';

type ValidationCase = {
  name: string;
  credentials: LoginDto;
  field: keyof LoginDto;
  message: string;
};

const validationCases: ValidationCase[] = [
  {
    name: 'empty username',
    credentials: { username: '', password: ADMIN_PASSWORD },
    field: 'username',
    message: 'Minimum username length: 4 characters'
  },
  {
    name: 'username shorter than four characters',
    credentials: { username: 'abc', password: ADMIN_PASSWORD },
    field: 'username',
    message: 'Minimum username length: 4 characters'
  },
  {
    name: 'password shorter than four characters',
    credentials: { username: ADMIN_USERNAME, password: 'abc' },
    field: 'password',
    message: 'Minimum password length: 4 characters'
  }
];

test.describe('/api/v1/users/signin API tests', () => {
  let loginClient: LoginClient;

  test.beforeEach(({ request }) => {
    loginClient = new LoginClient(request);
  });

  test('should successfully authenticate with valid credentials - 200', async () => {
    // given
    const credentials: LoginDto = {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    };

    // when
    const response = await loginClient.signIn(credentials);

    // then
    expect(response.status()).toBe(200);
    await expectValidLoginResponse(response, credentials.username);
  });

  for (const validationCase of validationCases) {
    test(`should return validation error for ${validationCase.name} - 400`, async () => {
      // when
      const response = await loginClient.signIn(validationCase.credentials);

      // then
      const responseBody = await expectJson(response, 400);
      expect(responseBody[validationCase.field]).toBe(validationCase.message);
    });
  }

  test('should return authentication error for invalid credentials - 422', async () => {
    // when
    const response = await loginClient.signIn({
      username: 'wronguser',
      password: 'wrongpassword'
    });

    // then
    expect(await expectJson(response, 422)).toEqual({
      message: 'Invalid username/password supplied'
    });
  });
});
