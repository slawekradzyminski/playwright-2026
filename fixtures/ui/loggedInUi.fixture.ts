import { test as base } from '../resources.fixture';
import { authStorageState } from './authStorageState';

export const test = base.extend({
  storageState: async ({ loggedInUser, baseURL }, use) => {
    await use(authStorageState(baseURL, loggedInUser));
  }
});

export { expect } from '@playwright/test';
