import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  protected readonly path = '/profile';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('profile-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Profile');
  }
}
