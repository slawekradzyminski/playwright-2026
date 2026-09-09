import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class ProfilePage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('profile-page');
    this.title = this.root.getByTestId('profile-title');
    this.emailInput = this.root.getByTestId('user-edit-email-input');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/profile');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Profile');
    await expect(this.title).toBeVisible();
  }
}
