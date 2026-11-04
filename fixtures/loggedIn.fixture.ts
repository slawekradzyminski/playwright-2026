import { UsersApi } from '../api/UsersApi';
import { generateUser } from '../generators/userGenerator';
import { ADMIN_PASSWORD, ADMIN_USERNAME, APP_BASE_URL } from '../test-config';
import type { LoggedInUser } from '../types/auth';
import { authStorageState } from './authStorageState';
import { test as pagesTest } from './pages.fixture';

type TestFixtures = {
  user: LoggedInUser;
};

type WorkerFixtures = {
  adminToken: string;
};

/** Starts each test with a freshly registered user already logged in on the frontend and deletes it afterwards. */
export const test = pagesTest.extend<TestFixtures, WorkerFixtures>({
  // Signed in once per worker; baseURL is a test-scoped option, so the URL comes from test-config.
  adminToken: [async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: APP_BASE_URL });
    const { token } = await new UsersApi(request).signin({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    await request.dispose();
    await use(token);
  }, { scope: 'worker' }],

  // Own request context: the built-in `request` fixture depends on storageState, which depends on this one.
  user: async ({ playwright, baseURL, adminToken }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    const usersApi = new UsersApi(request);
    const user = generateUser();
    await usersApi.signup(user);
    const { token, refreshToken } = await usersApi.signin(user);

    await use({ ...user, token, refreshToken });

    // Teardown runs after the test, whether it passed or failed.
    await usersApi.deleteUser(user.username, adminToken);
    await request.dispose();
  },

  storageState: async ({ user, baseURL }, use) => {
    await use(authStorageState(baseURL!, user));
  },
});

export { expect } from '@playwright/test';
