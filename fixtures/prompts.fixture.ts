import { test as base, registerAndLoginUser, deleteUserAsAdmin } from './loggedInUser.fixture';
import type { LoggedInUser } from './loggedInUser.fixture';

type PromptFixtures = {
  secondLoggedInUser: LoggedInUser;
};

export const test = base.extend<PromptFixtures>({
  secondLoggedInUser: async ({ request }, use) => {
    const secondUser = await registerAndLoginUser(request);
    await use(secondUser);
    await deleteUserAsAdmin(request, secondUser.user.username);
  }
});

export { expect } from '@playwright/test';
