import { test as base } from '@playwright/test';
import { deleteUserAsAdmin, registerAndLoginUser, type LoggedInUser } from '../loggedInUser.fixture';

import { authStorageState } from './authStorageState';

export const test = base.extend<{ loggedInUser: LoggedInUser }>({
  loggedInUser: async ({ request }, use) => {
    const authenticatedUser = await registerAndLoginUser(request);
    try {
      await use(authenticatedUser);
    } finally {
      await deleteUserAsAdmin(request, authenticatedUser.user.username);
    }
  },
  storageState: async ({ loggedInUser, baseURL }, use) => {
    await use(authStorageState(baseURL, loggedInUser));
  }
});

export { expect } from '@playwright/test';
