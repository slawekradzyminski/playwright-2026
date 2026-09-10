import { test as base, expect } from '@playwright/test';
import { SignupClient } from '../clients/signup-client';
import { LoginClient } from '../clients/login-client';
import { DeleteUserClient } from '../clients/delete-user-client';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-config';
import type { UserRegisterDto } from '../types/auth';

/**
 * Added for tests/api/signup.api.spec.ts so registration tests can create users
 * without repeating cleanup code or leaving test accounts in the application.
 * Tests import this `test` and receive a `signup` function that remembers each
 * successfully created account. After the test finishes, the fixture uses an
 * administrator token to delete those accounts. Cleanup is also attempted when
 * a test assertion fails; existing accounts are not added to the cleanup list.
 * Keeping this setup and cleanup here lets the specs focus on registration.
 */
export const test = base.extend<{
  signup: (user: UserRegisterDto) => ReturnType<SignupClient['signup']>;
}>({
  signup: async ({ request }, use) => {
    const login = await new LoginClient(request).login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    expect(login.status(), 'Authenticate cleanup administrator').toBe(200);
    const { token } = await login.json();
    expect(token, 'Cleanup administrator token').toEqual(expect.stringMatching(/\S+/));
    const signupClient = new SignupClient(request);
    const deleteUserClient = new DeleteUserClient(request);
    const created: string[] = [];
    try {
      await use(async (user) => {
        const response = await signupClient.signup(user);
        if (response.status() === 201) created.push(user.username);
        return response;
      });
    } finally {
      for (const username of created) {
        const response = await deleteUserClient.deleteUser(username, token);
        expect.soft(response.status(), `Cleanup of ${username}`).toBe(204);
      }
    }
  },
});
