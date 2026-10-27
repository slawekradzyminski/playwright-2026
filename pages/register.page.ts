import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { BasePage } from './base.page';
import { Toast } from './components/toast.component';
import type { UserRegisterDto } from '../types/user';

export class RegisterPage extends BasePage {
  protected readonly path = '/register';
  readonly root: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly usernameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly toast: Toast;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('register-page');
    this.usernameInput = page.getByTestId('register-username-input');
    this.emailInput = page.getByTestId('register-email-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.firstNameInput = page.getByTestId('register-firstname-input');
    this.lastNameInput = page.getByTestId('register-lastname-input');
    this.submitButton = page.getByTestId('register-submit-button');
    this.loginLink = page.getByTestId('register-login-link');
    this.usernameError = page.getByTestId('register-username-error');
    this.emailError = page.getByTestId('register-email-error');
    this.passwordError = page.getByTestId('register-password-error');
    this.firstNameError = page.getByTestId('register-firstname-error');
    this.lastNameError = page.getByTestId('register-lastname-error');
    this.toast = new Toast(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async openLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async expectRequiredErrors(): Promise<void> {
    await expect(this.usernameError).toHaveText('Username is required');
    await expect(this.emailError).toHaveText('Email is required');
    await expect(this.passwordError).toHaveText('Password is required');
    await expect(this.firstNameError).toHaveText('First name is required');
    await expect(this.lastNameError).toHaveText('Last name is required');
  }

  async expectFormLabels(): Promise<void> {
    await expect(this.usernameInput).toHaveAccessibleName('Username');
    await expect(this.emailInput).toHaveAccessibleName('Email');
    await expect(this.passwordInput).toHaveAccessibleName('Password');
    await expect(this.firstNameInput).toHaveAccessibleName('First Name');
    await expect(this.lastNameInput).toHaveAccessibleName('Last Name');
    await expect(this.submitButton).toHaveAccessibleName('Create account');
  }

  async register(user: UserRegisterDto): Promise<Response> {
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    const response = this.page.waitForResponse('**/api/v1/users/signup');
    await this.submitButton.click();
    return response;
  }
}
