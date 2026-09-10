import { expect } from '@playwright/test';
import { test as base } from './signup-fixture';
import { LoginClient } from '../clients/login-client';
import { UserGenerator } from '../generators/user-generator';
import type { UserRegisterDto } from '../types/auth';

export interface AuthenticatedUser {
  token: string;
  user: UserRegisterDto;
}

/** Test-scoped and lazy: signup owns cleanup, even if login or the test fails. */
export const test = base.extend<{ authenticatedUser: AuthenticatedUser }>({
  authenticatedUser: async ({ request, signup }, use) => {
    const user = UserGenerator.generate();
    expect((await signup(user)).status(), 'Register fixture user').toBe(201);

    const response = await new LoginClient(request).login({
      username: user.username,
      password: user.password,
    });
    expect(response.status(), 'Log in fixture user').toBe(200);
    const body = await response.json();
    expect(body.mfaRequired, 'Fixture user must not require MFA').toBe(false);
    expect(body.token, 'Fixture access token').toEqual(expect.stringMatching(/\S+/));
    await use({ token: body.token, user });
  },
});
