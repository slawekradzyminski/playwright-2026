import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class UsersPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('users-page');
    this.title = this.root.getByTestId('users-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/users');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Users');
    await expect(this.title).toBeVisible();
  }
}
