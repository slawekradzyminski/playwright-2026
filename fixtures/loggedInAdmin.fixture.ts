import { UsersApi } from '../api/UsersApi';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-config';
import type { LoginResponseDto } from '../types/auth';
import { authStorageState } from './authStorageState';
import { test as pagesTest } from './pages.fixture';

/**
 * Starts each test logged in as the predefined admin from .env.
 * The API cannot grant the admin role, so this account is shared and never deleted.
 */
export const test = pagesTest.extend<{ admin: LoginResponseDto }>({
  // Own request context: the built-in `request` fixture depends on storageState, which depends on this one.
  admin: async ({ playwright, baseURL }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    const admin = await new UsersApi(request).signin({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    await request.dispose();
    await use(admin);
  },
  storageState: async ({ admin, baseURL }, use) => {
    await use(authStorageState(baseURL!, admin));
  },
});

export { expect } from '@playwright/test';
