import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UsersPage extends BasePage {
  protected readonly path = '/users';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('users-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Users');
  }
}
