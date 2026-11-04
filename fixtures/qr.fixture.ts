import { QrApi } from '../api/QrApi';
import { test as loggedInTest } from './loggedIn.fixture';

type TestFixtures = {
  /** QR generator called as the logged in `user`; gives the reference PNG for a text. */
  qrApi: QrApi;
};

export const test = loggedInTest.extend<TestFixtures>({
  qrApi: async ({ playwright, baseURL, user }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(new QrApi(request, user.token));
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
