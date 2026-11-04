import { MfaApi } from '../api/MfaApi';
import { ProfileApi } from '../api/ProfileApi';
import { test as loggedInTest } from './loggedIn.fixture';

type ProfileFixtures = {
  /** Personal details and system prompts of the logged in `user`. */
  profileApi: ProfileApi;
  /** Two-factor authentication of the logged in `user`. */
  mfaApi: MfaApi;
};

export const test = loggedInTest.extend<ProfileFixtures>({
  profileApi: async ({ playwright, baseURL, user }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(new ProfileApi(request, user.token));
    await request.dispose();
  },

  mfaApi: async ({ playwright, baseURL, user }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(new MfaApi(request, user.token));
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
