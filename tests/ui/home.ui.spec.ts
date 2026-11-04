import type { Locator } from '@playwright/test';
import { expect, test } from '../../fixtures/loggedIn.fixture';
import type { HomePage } from '../../pages/HomePage';

const navigationButtons: { name: string; button: (homePage: HomePage) => Locator; path: string }[] = [
  { name: 'Products', button: (homePage) => homePage.productsButton, path: '/products' },
  { name: 'Users', button: (homePage) => homePage.usersButton, path: '/users' },
  { name: 'Profile & Orders', button: (homePage) => homePage.profileButton, path: '/profile' },
  { name: 'Open AI Assistant', button: (homePage) => homePage.llmButton, path: '/llm' },
  { name: 'Open Traffic Monitor', button: (homePage) => homePage.trafficButton, path: '/traffic' },
  { name: 'Generate QR Codes', button: (homePage) => homePage.qrButton, path: '/qr' },
  { name: 'Send Emails', button: (homePage) => homePage.emailButton, path: '/email' },
];

test.describe('Home page UI tests', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should greet logged in user by first name', async ({ homePage, user }) => {
    // then
    await expect(homePage.welcomeTitle).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(homePage.userEmail).toHaveText(user.email);
  });

  test('should show all home page sections', async ({ homePage }) => {
    // then
    await expect(homePage.featuresTitle).toHaveText('Daily control areas');
    await expect(homePage.aiTitle).toHaveText('Live prompting, chat, and tool flows');
    await expect(homePage.monitoringTitle).toHaveText('Advanced monitoring');
    await expect(homePage.utilitiesTitle).toHaveText('Supporting tools');
  });

  for (const { name, button, path } of navigationButtons) {
    test(`should navigate to ${path} when ${name} button is clicked`, async ({ homePage, page }) => {
      // when
      await button(homePage).click();

      // then
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    });
  }
});
