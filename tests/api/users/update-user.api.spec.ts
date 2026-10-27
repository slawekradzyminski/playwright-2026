import { test, expect } from '../fixtures';
import { generateUser } from '../../../generators/user-generator';
import { UsersClient } from '../../../http/users-client';

test.describe('PUT /api/v1/users/{username}', () => {
  test('updates the current user and persists profile fields - 200', async ({ api, request }) => {
    // given
    const { user, token } = await api.createUser();
    const edited = {
      email: `updated-${user.email}`,
      firstName: 'Updated',
      lastName: 'Profile',
    };

    // when
    const response = await new UsersClient(request, token).update(user.username, edited);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ username: user.username, ...edited, roles: ['ROLE_CLIENT'] });
    const persisted = await new UsersClient(request, token).getMe();
    expect(persisted.status()).toBe(200);
    expect(await persisted.json()).toMatchObject({ username: user.username, ...edited });
  });

  test('rejects invalid profile fields without changing the user - 400', async ({ api, request }) => {
    // given
    const { user, token } = await api.createUser();

    // when
    const response = await new UsersClient(request, token).update(user.username, {
      email: 'invalid-email',
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      email: 'Email should be valid',
    });
    const persisted = await new UsersClient(request, token).getMe();
    expect(persisted.status()).toBe(200);
    expect(await persisted.json()).toMatchObject({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  });

  test('rejects an unauthenticated update - 401', async ({ api, request }) => {
    // given
    const { user } = await api.createUser();

    // when
    const response = await new UsersClient(request).update(user.username, {
      email: `anonymous-${user.email}`,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('prevents a client from updating another user - 403', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    const { user: other, token: otherToken } = await api.createUser();

    // when
    const response = await new UsersClient(request, token).update(other.username, {
      email: `blocked-${other.email}`,
      firstName: 'Blocked',
      lastName: 'Update',
    });

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
    const persisted = await new UsersClient(request, otherToken).getMe();
    expect(persisted.status()).toBe(200);
    expect(await persisted.json()).toMatchObject({
      email: other.email,
      firstName: other.firstName,
      lastName: other.lastName,
    });
  });

  test('returns not found when an administrator updates a missing user - 404', async ({ api }) => {
    // given
    const client = await api.adminUsers();

    // when
    const response = await client.update(generateUser().username, {
      email: 'missing-user@example.test',
    });

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: "The user doesn't exist" });
  });
});
