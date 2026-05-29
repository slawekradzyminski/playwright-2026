import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import { LoggedInHeader } from '../components/LoggedInHeader';

export class HomePage {
  readonly page: Page;
  readonly header: LoggedInHeader;
  readonly homePage: Locator;
  readonly welcomeTitle: Locator;
  readonly userEmail: Locator;
  readonly productsButton: Locator;
  readonly usersButton: Locator;
  readonly profileButton: Locator;
  readonly llmButton: Locator;
  readonly trafficButton: Locator;
  readonly homeUrl: string;
  readonly usersUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.header = new LoggedInHeader(page);
    this.homePage = page.getByTestId('home-page');
    this.welcomeTitle = page.getByTestId('home-welcome-title');
    this.userEmail = page.getByTestId('home-user-email');
    this.productsButton = page.getByTestId('home-products-button');
    this.usersButton = page.getByTestId('home-users-button');
    this.profileButton = page.getByTestId('home-profile-button');
    this.llmButton = page.getByTestId('home-llm-button');
    this.trafficButton = page.getByTestId('home-traffic-button');
    this.homeUrl = `${APP_BASE_URL}/`;
    this.usersUrl = `${APP_BASE_URL}/users`;
  }

  async verifyLoggedInUser(user: { displayName: string; firstName: string; email: string }) {
    await expect(this.page).toHaveURL(this.homeUrl);
    await expect(this.homePage).toBeVisible();
    await expect(this.welcomeTitle).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(this.userEmail).toHaveText(user.email);
    await this.header.verifyVisible(user);
  }
}
