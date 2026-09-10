import { expect } from '@playwright/test';
import { test as base } from './admin-fixture';
import { SignupClient } from '../clients/users/signup-client';
import { DeleteUserClient } from '../clients/users/delete-user-client';
import type { UserRegisterDto } from '../types/auth';

/**
 * Added for tests/api/users/signup.api.spec.ts so registration tests can create users
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
  signup: async ({ request, adminToken }, use) => {
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
        const response = await deleteUserClient.deleteUser(username, adminToken);
        expect.soft(response.status(), `Cleanup of ${username}`).toBe(204);
      }
    }
  },
});
