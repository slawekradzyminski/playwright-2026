import { test as base, expect } from '@playwright/test';
import { LoginClient } from '../../http/loginClient';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../test-config';
import type { LoginResponseDto } from '../../types/auth';
import { expectValidLoginResponse } from '../../validators/authResponse';
import { authStorageState } from './authStorageState';

export const test = base.extend<{ loggedInAdmin: LoginResponseDto }>({
  loggedInAdmin: async ({ request }, use) => {
    const response = await new LoginClient(request).signIn({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    const authentication = await expectValidLoginResponse(response, ADMIN_USERNAME);
    expect(authentication.roles).toContain('ROLE_ADMIN');
    await use(authentication);
  },
  storageState: async ({ loggedInAdmin, baseURL }, use) => {
    await use(authStorageState(baseURL, loggedInAdmin));
  }
});

export { expect } from '@playwright/test';
