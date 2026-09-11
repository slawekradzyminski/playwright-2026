import { expect } from '@playwright/test';
import { test as base } from './admin';
import { SignupClient } from '../../clients/users/signup-client';
import { DeleteUserClient } from '../../clients/users/delete-user-client';
import type { UserRegisterDto } from '../../types/auth';

export const test = base.extend<{
  trackUser: (username: string) => void;
  signup: (user: UserRegisterDto) => ReturnType<SignupClient['signup']>;
}>({
  trackUser: async ({ request, adminToken }, use) => {
    const remove = new DeleteUserClient(request);
    const usernames = new Set<string>();
    try {
      await use(username => usernames.add(username));
    } finally {
      for (const username of usernames) {
        const response = await remove.deleteUser(username, adminToken);
        // Tests may delete the account themselves; UI registration may never create it.
        expect.soft([204, 404], `Cleanup of ${username}`).toContain(response.status());
      }
    }
  },
  signup: async ({ request, trackUser }, use) => {
    const client = new SignupClient(request);
    await use(async user => {
      const response = await client.signup(user);
      if (response.status() === 201) trackUser(user.username);
      return response;
    });
  },
});
