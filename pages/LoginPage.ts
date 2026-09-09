import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedOutPage } from './LoggedOutPage';
import { Toast } from './components/Toast';
import type { LoginDto } from '../types/auth';

export class LoginPage extends LoggedOutPage {
  readonly toast: Toast;
  readonly root: Locator;
  readonly title: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.root = page.getByTestId('login-page');
    this.title = this.root.getByTestId('login-title');
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.usernameError = page.getByTestId('login-username-error');
    this.passwordError = page.getByTestId('login-password-error');
    this.registerButton = page.getByTestId('login-register-link');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/login');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Sign in to your account');
    await expect(this.title).toBeVisible();
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
