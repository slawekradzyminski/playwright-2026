import { unauthorizedCases } from '../test-data/unauthorized-cases';
import { expect } from '@playwright/test';
import { test } from '../../../fixtures/authenticated-user-fixture';
import { CurrentUserClient } from '../../../clients/users/current-user-client';
import { expectRegisteredUser } from '../../../validators/user-response-validator';

test.describe('/api/v1/users/me API tests', () => {
  let client: CurrentUserClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new CurrentUserClient(request);
  });

  test('should return registered user details - 200', async ({ authenticatedUser }) => {
    // given
    const { token, user } = authenticatedUser;

    // when
    const response = await client.getMe(token);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expectRegisteredUser(await response.json(), user);
  });

  test('should reject unauthorized requests - 401', async ({ authenticatedUser }) => {
    // given
    const cases = unauthorizedCases(authenticatedUser.token);

    for (const { name, token, message } of cases) {
      await test.step(name, async () => {
        // when
        const response = await client.getMe(token);

        // then
        expect.soft(response.status()).toBe(401);
        expect.soft(await response.json()).toEqual({ message });
      });
    }
  });
});
