import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { APP_BASE_URL } from '../config/constants';
import type { RegisterDto } from '../types/auth';

const SUCCESSFUL_REGISTRATION_MESSAGE = 'Registration successful! You can now log in.';
const USERNAME_ALREADY_EXISTS_TOAST = 'Username already exists';

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

  async register(user: RegisterDto) {
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.submitButton.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async verifySuccessfulRegistrationToast() {
    await this.toast.verifyAlertSuccess(SUCCESSFUL_REGISTRATION_MESSAGE);
  }

  async verifyUsernameAlreadyExistsToast() {
    await this.toast.verifyAlertFailure(USERNAME_ALREADY_EXISTS_TOAST);
  }

  async verifyErrorToastVisible() {
    await expect(this.toast.title).toHaveText('Error');
  }

  async verifyRequiredFieldErrors() {
    await expect(this.usernameError).toHaveText('Username is required');
    await expect(this.emailError).toHaveText('Email is required');
    await expect(this.passwordError).toHaveText('Password is required');
    await expect(this.firstNameError).toHaveText('First name is required');
    await expect(this.lastNameError).toHaveText('Last name is required');
  }

  async verifyNoToast() {
    await expect(this.toast.viewport).toBeEmpty();
  }
}
