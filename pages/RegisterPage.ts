import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedOutPage } from './LoggedOutPage';
import { Toast } from './components/Toast';
import type { SignupDto } from '../types/auth';

export class RegisterPage extends LoggedOutPage {
  readonly toast: Toast;
  readonly root: Locator;
  readonly title: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly submitButton: Locator;
  readonly submitError: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.root = page.getByTestId('register-page');
    this.title = this.root.getByTestId('register-title');
    this.usernameInput = page.getByTestId('register-username-input');
    this.emailInput = page.getByTestId('register-email-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.firstNameInput = page.getByTestId('register-firstname-input');
    this.lastNameInput = page.getByTestId('register-lastname-input');
    this.usernameError = page.getByTestId('register-username-error');
    this.emailError = page.getByTestId('register-email-error');
    this.passwordError = page.getByTestId('register-password-error');
    this.firstNameError = page.getByTestId('register-firstname-error');
    this.lastNameError = page.getByTestId('register-lastname-error');
    this.submitButton = page.getByTestId('register-submit-button');
    this.submitError = page.getByTestId('register-submit-error');
    this.loginLink = page.getByTestId('register-login-link');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/register');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Create your account');
    await expect(this.title).toBeVisible();
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fill(user: SignupDto) {
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
  }

  async register(user: SignupDto) {
    await this.fill(user);
    await this.submitButton.click();
  }
}
