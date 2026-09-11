import { expect, mergeTests } from '@playwright/test';
import { test as uiTest } from './ui-fixture';
import { test as adminTest } from './admin-fixture';
import { UserGenerator } from '../generators/user-generator';
import { DeleteUserClient } from '../clients/users/delete-user-client';
import { SignupClient } from '../clients/users/signup-client';
import type { UserRegisterDto } from '../types/auth';

export const test = mergeTests(uiTest, adminTest).extend<{
  registrationUser: UserRegisterDto;
  existingRegistrationUser: UserRegisterDto;
}>({
  registrationUser: async ({ request, adminToken }, use) => {
    const user = UserGenerator.generate();
    const remove = new DeleteUserClient(request);
    try {
      await use(user);
    } finally {
      // The UI may fail before or after creation; only this unique account is removed.
      const response = await remove.deleteUser(user.username, adminToken);
      expect([204, 404], `Cleanup of ${user.username}`).toContain(response.status());
    }
  },
  existingRegistrationUser: async ({ request, registrationUser }, use) => {
    const signup = new SignupClient(request);
    expect((await signup.signup(registrationUser)).status()).toBe(201);
    await use(registrationUser);
  },
});
