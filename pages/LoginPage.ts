import type { Locator, Page } from '@playwright/test';
import type { LoginDto } from '../types/auth';
import { APP_BASE_URL } from '../config/constants';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerButton: Locator;
  readonly registerLink: Locator;
  readonly loginUrl: string;
  readonly registerUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByTestId('login-submit-button');
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.registerLink = page.getByRole('link', { name: 'Register' });
    this.loginUrl = `${APP_BASE_URL}/login`;
    this.registerUrl = `${APP_BASE_URL}/register`;
  }

  async goto() {
    await this.page.goto(this.loginUrl);
  }

  async login(credentials: LoginDto) {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }

  async clickRegisterButton() {
    await this.registerButton.click();
  }

  async clickRegisterLink() {
    await this.registerLink.click();
  }
}
