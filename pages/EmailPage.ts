import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class EmailPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('email-page');
    this.title = this.root.getByTestId('email-page-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/email');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Send Email');
    await expect(this.title).toBeVisible();
  }
}
