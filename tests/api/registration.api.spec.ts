import { test, expect } from './fixtures';
import { generateUser } from '../../generators/user-generator';
import { AuthClient } from '../../http/auth-client';
import type { UsersClient } from '../../http/users-client';
import type { ApiTestContext } from './support/api-test-context';
import type { UserRegisterDto } from '../../types/user';

test.describe('/api/v1/users/signup', () => {
  let authClient: AuthClient;
  let user: UserRegisterDto;
  let context: ApiTestContext;

  test.beforeEach(async ({ request, api }) => {
    authClient = new AuthClient(request);
    user = generateUser();
    context = api;
  });

  test('registers a user who can log in - 201', async () => {
    // when
    const response = await registerUser(user);

    // then
    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('');

    const loginResponse = await authClient.login({ username: user.username, password: user.password });
    expect(loginResponse.status()).toBe(200);
    expectRegisteredUser(await loginResponse.json(), user);
  });

  test('rejects an invalid email - 400', async () => {
    // given
    const invalidUser = { ...user, email: 'invalid-email' };

    // when
    const response = await registerUser(invalidUser);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ email: 'Email should be valid' });
  });

  test('rejects an already registered username - 400', async () => {
    // given
    const existingUser = await registerUser(user);
    expect(existingUser.status()).toBe(201);
    const duplicateUser = { ...generateUser(), username: user.username };

    // when
    const response = await registerUser(duplicateUser);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Username is already in use' });
  });

  test('rejects an already registered email - 400', async () => {
    // given
    const existingUser = await registerUser(user);
    expect(existingUser.status()).toBe(201);
    const duplicateUser = { ...generateUser(), email: user.email };

    // when
    const response = await registerUser(duplicateUser);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Email is already in use' });
  });

  test('rejects an invalid Bearer token - 401', async () => {
    // when
    const response = await registerUser(user, {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid or expired token' });
  });

  async function registerUser(user: UserRegisterDto, options?: Parameters<UsersClient['register']>[1]) {
    return context.registerUser(user, options);
  }
});

function expectRegisteredUser(body: unknown, user: UserRegisterDto) {
  expect(body).toMatchObject({
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: ['ROLE_CLIENT'],
    token: expect.stringMatching(/\S+/),
    refreshToken: expect.stringMatching(/\S+/),
    mfaRequired: false,
    challengeToken: null,
    challengeExpiresAt: null,
  });
}
