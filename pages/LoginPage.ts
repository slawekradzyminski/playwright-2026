import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import type { LoginDto } from '../types/auth';
import { APP_BASE_URL } from '../config/constants';

export class LoginPage {
  readonly page: Page;
  readonly toast: ToastAlert;
  readonly loginPage: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly registerButton: Locator;
  readonly registerLink: Locator;
  readonly loginUrl: string;
  readonly registerUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.toast = new ToastAlert(page);
    this.loginPage = page.getByTestId('login-page');
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.usernameError = page.getByTestId('login-username-error');
    this.passwordError = page.getByTestId('login-password-error');
    this.registerButton = page.getByTestId('login-register-link');
    this.registerLink = page.getByTestId('register-link');
    this.loginUrl = `${APP_BASE_URL}/login`;
    this.registerUrl = `${APP_BASE_URL}/register`;
  }

  async goto() {
    await this.page.goto(this.loginUrl);
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(this.loginUrl);
    await expect(this.loginPage).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
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
