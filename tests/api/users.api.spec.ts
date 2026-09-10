import { unauthorizedCases } from './test-data/unauthorized-cases';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/authenticated-user-fixture';
import { UsersClient } from '../../clients/users-client';
import { expectRegisteredUser } from '../../validators/user-response-validator';

test.describe('/api/v1/users API tests', () => {
  let client: UsersClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new UsersClient(request);
  });

  test('should return registered user details - 200', async ({ authenticatedUser }) => {
    // given
    const { token, user } = authenticatedUser;

    // when
    const response = await client.getAll(token);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    const matchingUsers = users.filter((entry: { username: string }) => entry.username === user.username);
    expect(matchingUsers).toHaveLength(1);
    expectRegisteredUser(matchingUsers[0], user);
    for (const entry of users) {
      expect(Object.keys(entry).sort()).toEqual(['email', 'firstName', 'id', 'lastName', 'roles', 'username']);
    }
  });

  test('should reject unauthorized requests - 401', async ({ authenticatedUser }) => {
    // given
    const cases = unauthorizedCases(authenticatedUser.token);

    for (const { name, token, message } of cases) {
      await test.step(name, async () => {
        // when
        const response = await client.getAll(token);

        // then
        expect.soft(response.status()).toBe(401);
        expect.soft(await response.json()).toEqual({ message });
      });
    }
  });
});
