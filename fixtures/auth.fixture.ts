import { test as base } from '@playwright/test';
import { createRegisterUser } from '../generators/userGenerator';
import { enablePlaywrightUiStyleSnapshots } from './ui.fixture';
import { LoginClient } from '../http-clients/LoginClient';
import { RegisterClient } from '../http-clients/RegisterClient';

interface AuthUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  token: string;
  refreshToken: string;
}

interface AuthFixtures {
  authUser: AuthUser;
}

export const test = base.extend<AuthFixtures>({
  authUser: async ({ request }, use) => {
    // given
    const user = createRegisterUser();
    const registerClient = new RegisterClient(request);
    const loginClient = new LoginClient(request);

    await registerClient.createUser(user);

    // when
    const loginResponse = await loginClient.loginSuccessfully({
      username: user.username,
      password: user.password
    });

    // then
    await use({
      username: loginResponse.username,
      email: loginResponse.email,
      firstName: loginResponse.firstName,
      lastName: loginResponse.lastName,
      displayName: `${loginResponse.firstName} ${loginResponse.lastName}`,
      roles: loginResponse.roles,
      token: loginResponse.token,
      refreshToken: loginResponse.refreshToken
    });
  },

  page: async ({ page, authUser }, use) => {
    await enablePlaywrightUiStyleSnapshots(page);

    await page.addInitScript(({ token, refreshToken }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('refreshToken', refreshToken);
    }, {
      token: authUser.token,
      refreshToken: authUser.refreshToken
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';
