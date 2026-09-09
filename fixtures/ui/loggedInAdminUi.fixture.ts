import { test as base } from '../resources.fixture';
import { authStorageState } from './authStorageState';

export const test = base.extend({
  storageState: async ({ loggedInAdmin, baseURL }, use) => {
    await use(authStorageState(baseURL, loggedInAdmin));
  }
});

export { expect } from '@playwright/test';
