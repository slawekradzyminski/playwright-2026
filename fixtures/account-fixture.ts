import { expect } from '@playwright/test';
import { test as base } from './admin-fixture';
import { LoginClient } from '../clients/users/login-client';
import { SignupClient } from '../clients/users/signup-client';
import { DeleteUserClient } from '../clients/users/delete-user-client';
import { UserGenerator } from '../generators/user-generator';
import type { UserRegisterDto } from '../types/auth';

export interface AccountSession {
  user: UserRegisterDto;
  token: string;
  refreshToken: string;
}

export const test = base.extend<{
  account: AccountSession;
  createAccount: (overrides?: Partial<UserRegisterDto>) => Promise<AccountSession>;
}>({
  createAccount: async ({ request, adminToken }, use) => {
    const created: UserRegisterDto[] = [];
    const signup = new SignupClient(request);
    const login = new LoginClient(request);
    const remove = new DeleteUserClient(request);
    try {
      await use(async (overrides = {}) => {
        const user = UserGenerator.generate(overrides);
        expect((await signup.signup(user)).status(), `Register ${user.username}`).toBe(201);
        created.push(user);
        const response = await login.login({ username: user.username, password: user.password });
        expect(response.status(), `Authenticate ${user.username}`).toBe(200);
        const body = await response.json();
        expect(body.roles).toEqual(['ROLE_CLIENT']);
        expect(body.mfaRequired).toBe(false);
        expect(body.token).toEqual(expect.stringMatching(/\S+/));
        expect(body.refreshToken).toEqual(expect.stringMatching(/\S+/));
        return { user, token: body.token, refreshToken: body.refreshToken };
      });
    } finally {
      for (const user of created) {
        const response = await remove.deleteUser(user.username, adminToken);
        expect.soft([204, 404], `Cleanup of ${user.username}`).toContain(response.status());
      }
    }
  },
  account: async ({ createAccount }, use) => {
    await use(await createAccount());
  },
});
