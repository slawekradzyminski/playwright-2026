import type { Locator, Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { APP_BASE_URL } from '../config/constants';

export class RegisterPage {
  readonly page: Page;
  readonly toast: ToastAlert;
  readonly registerPage: Locator;
  readonly title: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;
  readonly loginButton: Locator;
  readonly usernameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly registerUrl: string;
  readonly loginUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.toast = new ToastAlert(page);
    this.registerPage = page.getByTestId('register-page');
    this.title = page.getByTestId('register-title');
    this.usernameInput = page.getByTestId('register-username-input');
    this.emailInput = page.getByTestId('register-email-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.firstNameInput = page.getByTestId('register-firstname-input');
    this.lastNameInput = page.getByTestId('register-lastname-input');
    this.submitButton = page.getByTestId('register-submit-button');
    this.loginButton = page.getByTestId('register-login-link');
    this.usernameError = page.getByTestId('register-username-error');
    this.emailError = page.getByTestId('register-email-error');
    this.passwordError = page.getByTestId('register-password-error');
    this.firstNameError = page.getByTestId('register-firstname-error');
    this.lastNameError = page.getByTestId('register-lastname-error');
    this.registerUrl = `${APP_BASE_URL}/register`;
    this.loginUrl = `${APP_BASE_URL}/login`;
  }

  async goto() {
    await this.page.goto(this.registerUrl);
  }

  async submit() {
    await this.submitButton.click();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }
}
