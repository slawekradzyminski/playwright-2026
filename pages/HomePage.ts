import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly welcomeTitle: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeTitle = page.getByTestId('home-welcome-title');
    this.profileLink = page.getByTestId('username-profile-link');
    this.logoutButton = page.getByTestId('logout-button');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.welcomeTitle).toHaveText(/^Welcome, .+!$/);
    await expect(this.logoutButton).toBeVisible();
  }
}
