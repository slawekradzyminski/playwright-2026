import { test as base, expect } from '@playwright/test';
import { SignupClient } from '../clients/signup-client';
import { LoginClient } from '../clients/login-client';
import { DeleteUserClient } from '../clients/delete-user-client';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-config';
import type { UserRegisterDto } from '../types/auth';

export const test = base.extend<{
  signup: (user: UserRegisterDto) => ReturnType<SignupClient['signup']>;
}>({
  signup: async ({ request }, use) => {
    const login = await new LoginClient(request).login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    expect(login.status(), 'Administrator authentication for fixture cleanup').toBe(200);
    const { token } = await login.json();
    const created: string[] = [];
    try {
      await use(async (user) => {
        const response = await new SignupClient(request).signup(user);
        if (response.status() === 201) created.push(user.username);
        return response;
      });
    } finally {
      for (const username of created) {
        const response = await new DeleteUserClient(request).deleteUser(username, token);
        expect(response.status(), `Cleanup of ${username}`).toBe(204);
      }
    }
  },
});

