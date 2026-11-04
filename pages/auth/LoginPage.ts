import { expect, type Locator, type Page } from '@playwright/test';
import type { LoginDto } from '../../types/auth';
import { BasePage } from '../BasePage';
import { LoggedOutHeader } from '../components/LoggedOutHeader';

export class LoginPage extends BasePage {
  protected readonly path = '/login';
  readonly header: LoggedOutHeader;
  readonly title: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly submitButton: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedOutHeader(page);
    this.title = page.getByTestId('login-title');
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.usernameError = page.getByTestId('login-username-error');
    this.passwordError = page.getByTestId('login-password-error');
    this.submitButton = page.getByTestId('login-submit-button');
    this.registerButton = page.getByTestId('login-register-link');
  }

  async login({ username, password }: LoginDto) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Sign in to your account');
  }
}
