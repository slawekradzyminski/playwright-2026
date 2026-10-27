import { test, expect } from '../fixtures';
import { UsersClient } from '../../../http/users-client';

test.describe('GET /api/v1/users', () => {
  test('returns the user list to an administrator - 200', async ({ api, request }) => {
    // given
    const { user } = await api.createUser();
    const client = await api.adminUsers();

    // when
    const response = await client.getAll();

    // then
    expect(response.status()).toBe(200);
    const users = await response.json();
    const owned = users.find((entry: { username: string }) => entry.username === user.username);
    expect(owned).toMatchObject({ username: user.username, email: user.email, roles: ['ROLE_CLIENT'] });
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // when
    const response = await new UsersClient(request).getAll();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
