import { expect, mergeTests } from '@playwright/test';
import { test as pagesTest } from './pages';
import { test as signupTest } from '../shared/signup';
import { UserGenerator } from '../../generators/user-generator';
import type { UserRegisterDto } from '../../types/auth';

export const test = mergeTests(pagesTest, signupTest).extend<{
  registrationUser: UserRegisterDto;
  existingRegistrationUser: UserRegisterDto;
}>({
  registrationUser: async ({ trackUser }, use) => {
    const user = UserGenerator.generate();
    // Track before the UI action, so a failure after creation still cleans up.
    trackUser(user.username);
    await use(user);
  },
  existingRegistrationUser: async ({ signup, registrationUser }, use) => {
    expect((await signup(registrationUser)).status()).toBe(201);
    await use(registrationUser);
  },
});
