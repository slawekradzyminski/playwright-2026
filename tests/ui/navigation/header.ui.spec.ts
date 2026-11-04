import type { Locator, Page } from '@playwright/test';
import { test as adminTest } from '../../../fixtures/loggedInAdmin.fixture';
import { expect, test as userTest } from '../../../fixtures/loggedIn.fixture';
import type { BasePage } from '../../../pages/BasePage';
import { CartPage } from '../../../pages/shop/CartPage';
import type { LoggedInHeader } from '../../../pages/components/LoggedInHeader';
import { EmailPage } from '../../../pages/tools/EmailPage';
import { LlmPage } from '../../../pages/tools/LlmPage';
import { ProductsPage } from '../../../pages/shop/ProductsPage';
import { ProfilePage } from '../../../pages/users/ProfilePage';
import { QrCodePage } from '../../../pages/tools/QrCodePage';
import { TrafficMonitorPage } from '../../../pages/tools/TrafficMonitorPage';

const menuLinks: { name: string; link: (header: LoggedInHeader) => Locator; TargetPage: new (page: Page) => BasePage }[] = [
  { name: 'Products', link: (header) => header.productsLink, TargetPage: ProductsPage },
  { name: 'Send Email', link: (header) => header.sendEmailLink, TargetPage: EmailPage },
  { name: 'QR Code', link: (header) => header.qrCodeLink, TargetPage: QrCodePage },
  { name: 'LLM', link: (header) => header.llmLink, TargetPage: LlmPage },
  { name: 'Traffic Monitor', link: (header) => header.trafficMonitorLink, TargetPage: TrafficMonitorPage },
  { name: 'cart', link: (header) => header.cartLink, TargetPage: CartPage },
  { name: 'profile', link: (header) => header.profileLink, TargetPage: ProfilePage },
];

userTest.describe('Logged in header UI tests - regular user', () => {
  userTest.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  userTest('should show user menu without admin link', async ({ homePage, user }) => {
    // then
    await homePage.header.expectCommonMenuLinks();
    await expect(homePage.header.profileLink).toHaveText(`${user.firstName} ${user.lastName}`);
    await expect(homePage.header.adminLink).toBeHidden();
  });

  for (const { name, link, TargetPage } of menuLinks) {
    userTest(`should open ${TargetPage.name} when ${name} link is clicked`, async ({ homePage, page }) => {
      // when
      await link(homePage.header).click();

      // then
      await new TargetPage(page).expectToBeOpen();
    });
  }

  userTest('should return to home page when brand logo is clicked', async ({ homePage }) => {
    // given
    await homePage.header.productsLink.click();

    // when
    await homePage.header.brandLink.click();

    // then
    await homePage.expectToBeOpen();
  });

  userTest('should log out and block access to home page', async ({ homePage, loginPage, page }) => {
    // when
    await homePage.header.clickLogout();

    // then
    await loginPage.expectToBeOpen();
    await loginPage.header.expectToBeVisible();

    // when
    await page.goto('/');

    // then
    await loginPage.expectToBeOpen();
  });

  userTest('should redirect regular user away from admin page', async ({ adminPage, homePage }) => {
    // when
    await adminPage.page.goto('/admin');

    // then
    await homePage.expectToBeOpen();
    await expect(adminPage.dashboard).toBeHidden();
  });
});

adminTest.describe('Logged in header UI tests - admin', () => {
  adminTest.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  adminTest('should show user menu with admin link', async ({ homePage, admin }) => {
    // then
    await homePage.header.expectCommonMenuLinks();
    await expect(homePage.header.profileLink).toHaveText(`${admin.firstName} ${admin.lastName}`);
    await expect(homePage.header.adminLink).toHaveText('Admin');
  });

  adminTest('should open admin dashboard when admin link is clicked', async ({ homePage, adminPage }) => {
    // when
    await homePage.header.adminLink.click();

    // then
    await adminPage.expectToBeOpen();
  });
});
