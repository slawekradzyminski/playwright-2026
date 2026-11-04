import { EmailEventsApi } from '../api/EmailEventsApi';
import { test as loggedInTest } from './loggedIn.fixture';

type EmailFixtures = { emailEventsApi: EmailEventsApi };

export const test = loggedInTest.extend<EmailFixtures>({
  emailEventsApi: async ({ playwright, baseURL, user }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(new EmailEventsApi(request, user.token));
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
