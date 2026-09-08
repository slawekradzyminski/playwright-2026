import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Toast } from './components/Toast';
import type { LoginDto } from '../types/auth';

export class LoginPage extends BasePage {
  readonly toast: Toast;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly registerButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.usernameError = page.getByTestId('login-username-error');
    this.passwordError = page.getByTestId('login-password-error');
    this.registerButton = page.getByTestId('login-register-link');
    this.registerLink = page.getByTestId('register-link');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(credentials: LoginDto) {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }
}
