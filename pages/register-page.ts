import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { LoggedOutHeader } from './components/logged-out-header';

export class RegisterPage extends BasePage {
  readonly header: LoggedOutHeader;

  constructor(page: Page) {
    super(page, '/register', 'register-page');
    this.header = new LoggedOutHeader(page);
  }

  async expectTitle() {
    await expect(this.root.getByTestId('register-title')).toHaveText('Create your account');
  }
}
