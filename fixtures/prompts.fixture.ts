import { test as base } from './loggedInUser.fixture';
import type { LoggedInUser } from './loggedInUser.fixture';

type PromptFixtures = {
  secondLoggedInUser: LoggedInUser;
};

export const test = base.extend<PromptFixtures>({
  secondLoggedInUser: async ({ accountFactory }, use) => {
    await use(await accountFactory.create());
  }
});

export { expect } from '@playwright/test';
