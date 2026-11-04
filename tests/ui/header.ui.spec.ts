import type { Locator } from '@playwright/test';
import { test as adminTest } from '../../fixtures/loggedInAdmin.fixture';
import { expect, test as userTest } from '../../fixtures/loggedIn.fixture';
import type { LoggedInHeader } from '../../pages/components/LoggedInHeader';

const menuLinks: { name: string; link: (header: LoggedInHeader) => Locator; path: string }[] = [
  { name: 'Products', link: (header) => header.productsLink, path: '/products' },
  { name: 'Send Email', link: (header) => header.sendEmailLink, path: '/email' },
  { name: 'QR Code', link: (header) => header.qrCodeLink, path: '/qr' },
  { name: 'LLM', link: (header) => header.llmLink, path: '/llm' },
  { name: 'Traffic Monitor', link: (header) => header.trafficMonitorLink, path: '/traffic' },
  { name: 'cart', link: (header) => header.cartLink, path: '/cart' },
  { name: 'profile', link: (header) => header.profileLink, path: '/profile' },
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

  for (const { name, link, path } of menuLinks) {
    userTest(`should navigate to ${path} when ${name} link is clicked`, async ({ homePage, page }) => {
      // when
      await link(homePage.header).click();

      // then
      await expect(page).toHaveURL(new RegExp(`${path}$`));
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
