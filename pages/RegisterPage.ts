import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedOutHeader } from './components/LoggedOutHeader';

export class RegisterPage extends BasePage {
  protected readonly path = '/register';
  readonly header: LoggedOutHeader;
  readonly title: Locator;
  readonly usernameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedOutHeader(page);
    this.title = page.getByTestId('register-title');
    this.usernameInput = page.getByTestId('register-username-input');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Create your account');
    await expect(this.usernameInput).toBeVisible();
  }
}
