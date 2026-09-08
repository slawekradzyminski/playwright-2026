import { test as base, expect } from './products.fixture';
import { registerAndLoginUser, type LoggedInUser } from './loggedInUser.fixture';
import { UserClient } from '../http/userClient';

type AccountFactory = {
  create: () => Promise<LoggedInUser>;
};

export const test = base.extend<{ accountFactory: AccountFactory }>({
  accountFactory: async ({ request, adminToken, productIds }, use) => {
    // Establish teardown order: accounts and their references before products.
    void productIds;
    const accounts: LoggedInUser[] = [];
    const create = async () => {
      const account = await registerAndLoginUser(request);
      accounts.push(account);
      return account;
    };

    try {
      await use({ create });
    } finally {
      const cleanup = await Promise.allSettled(accounts.map(async account => {
        const response = await new UserClient(request).deleteUser(account.user.username, adminToken);
        expect([204, 404], `Cleanup account ${account.user.username}`).toContain(response.status());
      }));
      expect(cleanup.filter(result => result.status === 'rejected'), 'All disposable accounts must be cleaned up').toEqual([]);
    }
  }
});

export { expect } from '@playwright/test';

