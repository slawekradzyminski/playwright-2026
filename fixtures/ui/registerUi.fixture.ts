import { test as base } from './loginUi.fixture';
import { generateSignupUser } from '../../generators/userGenerator';
import { deleteUserAsAdmin } from '../loggedInUser.fixture';
import type { SignupDto } from '../../types/auth';

export const test = base.extend<{ signupUser: SignupDto }>({
  signupUser: async ({ request }, use) => {
    const user = generateSignupUser();
    try {
      await use(user);
    } finally {
      // Also clean up if registration succeeds but a later UI assertion fails.
      await deleteUserAsAdmin(request, user.username);
    }
  }
});

export { expect } from '@playwright/test';
