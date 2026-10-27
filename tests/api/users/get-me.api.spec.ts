import { test, expect } from '../fixtures';
import { UsersClient } from '../../../http/users-client';

test.describe('GET /api/v1/users/me', () => {
  test('returns the authenticated user - 200', async ({ api, request }) => {
    // given
    const { user, token } = await api.createUser();

    // when
    const response = await new UsersClient(request, token).getMe();

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
    const response = await new UsersClient(request).getMe();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
