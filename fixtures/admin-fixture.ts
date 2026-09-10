import { test as base, expect } from '@playwright/test';
import { LoginClient } from '../clients/users/login-client';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-config';

/** Lazy, test-scoped admin authentication shared by setup, tests and cleanup. */
export const test = base.extend<{ adminToken: string }>({
  adminToken: async ({ request }, use) => {
    const response = await new LoginClient(request).login({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    });
    expect(response.status(), 'Authenticate administrator').toBe(200);
    const body = await response.json();
    expect(body.mfaRequired).toBe(false);
    expect(body.roles).toContain('ROLE_ADMIN');
    expect(body.token).toEqual(expect.stringMatching(/\S+/));
    await use(body.token);
  },
});
