import { mergeTests } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { test as pagesTest } from './pages';
import { test as accountTest } from '../shared/account';
import { test as adminSessionTest } from '../shared/admin';
import type { Session } from '../shared/session';
import { APP_BASE_URL } from '../../test-config';

// Seed initial storage only: an init script would restore credentials after logout.
function storageState(session: Session) {
  return {
    cookies: [],
    origins: [{
      origin: new URL(APP_BASE_URL).origin,
      localStorage: [
        { name: 'token', value: session.token },
        { name: 'refreshToken', value: session.refreshToken },
        { name: 'clientSessionId', value: randomUUID() },
      ],
    }],
  };
}

export const test = mergeTests(pagesTest, accountTest).extend({
  storageState: async ({ account }, use) => {
    await use(storageState(account));
  },
});

export const adminTest = mergeTests(pagesTest, adminSessionTest).extend({
  storageState: async ({ adminSession }, use) => {
    await use(storageState(adminSession));
  },
});
