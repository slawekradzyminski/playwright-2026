import { randomUUID } from 'node:crypto';
import { test as base, expect } from '../api/fixtures';
import { generateUser } from '../../generators/user-generator';
import { AuthClient } from '../../http/auth-client';
import type { LoginDto, LoginResponseDto } from '../../types/auth';
import type { UserRegisterDto } from '../../types/user';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../test-config';

export const test = base.extend<{
  authenticatedUser: UserRegisterDto;
  loginCredentials: LoginDto;
}>({
  authenticatedUser: async ({ api }, use) => {
    const user = generateUser();
    const response = await api.registerUser(user);
    expect(response.status(), 'Registration of a UI test user').toBe(201);
    await use(user);
  },
  loginCredentials: async ({ authenticatedUser }, use) => {
    const { username, password } = authenticatedUser;
    await use({ username, password });
  },
  context: async ({ context, request, baseURL, loginCredentials }, use) => {
    if (!baseURL) throw new Error('Authenticated UI tests require baseURL');
    const clientSessionId = randomUUID();
    const response = await new AuthClient(request).login(loginCredentials, {
      headers: { 'X-Client-Session-Id': clientSessionId },
    });
    expect(response.status(), 'API login of a UI test user').toBe(200);
    const session: LoginResponseDto = await response.json();
    expect(session.mfaRequired, 'The UI fixture requires login without MFA').toBe(false);
    expect(session.token).toEqual(expect.stringMatching(/\S+/));
    expect(session.refreshToken).toEqual(expect.stringMatching(/\S+/));
    if (session.mfaRequired) throw new Error('MFA login is not supported by this fixture');

    await context.setStorageState({
      cookies: [],
      origins: [{
        origin: new URL(baseURL).origin,
        localStorage: [
          { name: 'token', value: session.token },
          { name: 'refreshToken', value: session.refreshToken },
          { name: 'clientSessionId', value: response.headers()['x-client-session-id'] ?? clientSessionId },
        ],
      }],
    });
    await use(context);
  },
});

// Use only for read-only admin journeys; never mutate, delete, or log out this account.
export const adminTest = test.extend({
  loginCredentials: async ({}, use) => {
    await use({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  },
});

export { expect };
