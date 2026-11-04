import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../../fixtures/loggedIn.fixture';
import type { BasePage } from '../../pages/BasePage';
import { CartPage } from '../../pages/CartPage';
import { EmailPage } from '../../pages/EmailPage';
import type { HomePage } from '../../pages/HomePage';
import { LlmPage } from '../../pages/LlmPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { QrCodePage } from '../../pages/QrCodePage';
import { TrafficMonitorPage } from '../../pages/TrafficMonitorPage';
import { UsersPage } from '../../pages/UsersPage';

const navigationButtons: { name: string; button: (homePage: HomePage) => Locator; TargetPage: new (page: Page) => BasePage }[] = [
  { name: 'Products', button: (homePage) => homePage.productsButton, TargetPage: ProductsPage },
  { name: 'Users', button: (homePage) => homePage.usersButton, TargetPage: UsersPage },
  { name: 'Profile & Orders', button: (homePage) => homePage.profileButton, TargetPage: ProfilePage },
  { name: 'Open AI Assistant', button: (homePage) => homePage.llmButton, TargetPage: LlmPage },
  { name: 'Open Traffic Monitor', button: (homePage) => homePage.trafficButton, TargetPage: TrafficMonitorPage },
  { name: 'Generate QR Codes', button: (homePage) => homePage.qrButton, TargetPage: QrCodePage },
  { name: 'Send Emails', button: (homePage) => homePage.emailButton, TargetPage: EmailPage },
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

  for (const { name, button, TargetPage } of navigationButtons) {
    test(`should open ${TargetPage.name} when ${name} button is clicked`, async ({ homePage, page }) => {
      // when
      await button(homePage).click();

      // then
      await new TargetPage(page).expectToBeOpen();
    });
  }
});
