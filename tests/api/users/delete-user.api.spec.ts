import { test, expect } from '../fixtures';
import { generateUser } from '../../../generators/user-generator';
import { UsersClient } from '../../../http/users-client';

test.describe('DELETE /api/v1/users/{username}', () => {
  test('allows an administrator to delete a user - 204', async ({ api }) => {
    // given
    const { user } = await api.createUser();
    const client = await api.adminUsers();

    // when
    const response = await client.delete(user.username);
    if (response.status() === 204) api.forgetUser(user.username);

    // then
    expect(response.status()).toBe(204);
    const persisted = await client.getByUsername(user.username);
    expect(persisted.status()).toBe(404);
  });

  test('rejects an unauthenticated deletion - 401', async ({ api, request }) => {
    // given
    const { user } = await api.createUser();

    // when
    const response = await new UsersClient(request).delete(user.username);
    if (response.status() === 204) api.forgetUser(user.username);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('prevents a client from deleting a user - 403', async ({ api, request }) => {
    // given
    const { user, token } = await api.createUser();
    const client = new UsersClient(request, token);

    // when
    const response = await client.delete(user.username);
    if (response.status() === 204) api.forgetUser(user.username);

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
    expect((await new UsersClient(request, token).getMe()).status()).toBe(200);
  });

  test('returns not found when an administrator deletes a missing user - 404', async ({ api }) => {
    // given
    const client = await api.adminUsers();

    // when
    const response = await client.delete(generateUser().username);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: "The user doesn't exist" });
  });
});
