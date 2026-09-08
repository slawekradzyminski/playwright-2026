import { test as base, expect } from '@playwright/test';
import { generateSignupUser } from '../../generators/userGenerator';
import { SignupClient } from '../../http/signupClient';
import { deleteUserAsAdmin } from '../loggedInUser.fixture';
import type { SignupDto } from '../../types/auth';

export const test = base.extend<{
  registeredUser: SignupDto;
}>({
  registeredUser: async ({ request }, use) => {
    const user = generateSignupUser();
    const response = await new SignupClient(request).signUp(user);
    expect(response.status(), 'Create disposable login user through the API').toBe(201);

    try {
      await use(user);
    } finally {
      await deleteUserAsAdmin(request, user.username);
    }
  }
});

export { expect } from '@playwright/test';
