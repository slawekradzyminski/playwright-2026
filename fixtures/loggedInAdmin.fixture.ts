import { test as base, expect } from './loggedInUser.fixture';
import { LoginClient } from '../http/loginClient';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../test-config';
import { expectValidLoginResponse } from '../validators/authResponse';

export const test = base.extend<{ adminToken: string }>({
  // Independent, test-scoped login for any endpoint requiring the admin role.
  // Concurrent logins remain valid; no shared mutable token or logout.
  adminToken: async ({ request }, use) => {
    const response = await new LoginClient(request).signIn({
      username: ADMIN_USERNAME, password: ADMIN_PASSWORD
    });
    expect(response.status()).toBe(200);
    const auth = await expectValidLoginResponse(response, ADMIN_USERNAME);
    expect(auth.roles).toContain('ROLE_ADMIN');
    await use(auth.token);
  }
});

export { expect } from '@playwright/test';
