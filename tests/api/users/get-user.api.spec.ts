import { test, expect } from '../fixtures';
import { generateUser } from '../../../generators/user-generator';
import { UsersClient } from '../../../http/users-client';

test.describe('GET /api/v1/users/{username}', () => {
  test('returns the requested public user - 200', async ({ api, request }) => {
    // given
    const { user, token } = await api.createUser();

    // when
    const response = await new UsersClient(request, token).getByUsername(user.username);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: ['ROLE_CLIENT'],
    });
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // when
    const response = await new UsersClient(request).getByUsername(generateUser().username);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('returns not found for an unknown username - 404', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    const missingUsername = generateUser().username;

    // when
    const response = await new UsersClient(request, token).getByUsername(missingUsername);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: "The user doesn't exist" });
  });
});
