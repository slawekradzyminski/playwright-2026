import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class HomePage {
  readonly page: Page;
  readonly homePage: Locator;
  readonly welcomeTitle: Locator;
  readonly userEmail: Locator;
  readonly usernameProfileLink: Locator;
  readonly logoutButton: Locator;
  readonly productsMenuLink: Locator;
  readonly homeUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.homePage = page.getByTestId('home-page');
    this.welcomeTitle = page.getByTestId('home-welcome-title');
    this.userEmail = page.getByTestId('home-user-email');
    this.usernameProfileLink = page.getByTestId('username-profile-link');
    this.logoutButton = page.getByTestId('logout-button');
    this.productsMenuLink = page.getByTestId('desktop-menu-products');
    this.homeUrl = `${APP_BASE_URL}/`;
  }

  async verifyLoggedInUser(user: { displayName: string; firstName: string; email: string }) {
    await expect(this.page).toHaveURL(this.homeUrl);
    await expect(this.homePage).toBeVisible();
    await expect(this.welcomeTitle).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(this.userEmail).toHaveText(user.email);
    await expect(this.usernameProfileLink).toHaveText(user.displayName);
    await expect(this.logoutButton).toBeVisible();
    await expect(this.productsMenuLink).toBeVisible();
  }
}
