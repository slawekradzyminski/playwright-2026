import { expect, test as base, type APIRequestContext } from '@playwright/test';
import { generateSignupUser } from '../generators/userGenerator';
import { LoginClient } from '../http/loginClient';
import { SignupClient } from '../http/signupClient';
import { UserClient } from '../http/userClient';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-config';
import type { SignupDto } from '../types/auth';
import { expectValidLoginResponse } from '../validators/authResponse';

export type LoggedInUser = {
  user: SignupDto;
  token: string;
  refreshToken: string;
};

type Fixtures = {
  loggedInUser: LoggedInUser;
};

async function registerAndLoginUser(request: APIRequestContext): Promise<LoggedInUser> {
  const user = generateSignupUser();
  const signupClient = new SignupClient(request);
  const loginClient = new LoginClient(request);

  await signupClient.signUp(user);

  const loginResponse = await loginClient.signIn({
    username: user.username,
    password: user.password
  });
  const authentication = await expectValidLoginResponse(loginResponse, user.username);

  return {
    user,
    token: authentication.token,
    refreshToken: authentication.refreshToken
  };
}

async function deleteUserAsAdmin(request: APIRequestContext, username: string): Promise<void> {
  const loginClient = new LoginClient(request);
  const userClient = new UserClient(request);

  const adminLoginResponse = await loginClient.signIn({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD
  });
  const adminAuthentication = await expectValidLoginResponse(adminLoginResponse, ADMIN_USERNAME);

  const deleteResponse = await userClient.deleteUser(username, adminAuthentication.token);
  expect([204, 404]).toContain(deleteResponse.status());
}

export const test = base.extend<Fixtures>({
  loggedInUser: async ({ request }, use) => {
    // before test
    const authenticatedUser = await registerAndLoginUser(request);

    // injection to test
    await use(authenticatedUser);

    // after test
    await deleteUserAsAdmin(request, authenticatedUser.user.username);
  }
});

export { expect } from '@playwright/test';
