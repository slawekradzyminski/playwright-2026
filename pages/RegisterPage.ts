import { expect, type Locator, type Page } from '@playwright/test';
import type { RegisterDto } from '../types/auth';
import { BasePage } from './BasePage';
import { LoggedOutHeader } from './components/LoggedOutHeader';

export class RegisterPage extends BasePage {
  protected readonly path = '/register';
  readonly header: LoggedOutHeader;
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
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedOutHeader(page);
    this.title = page.getByTestId('register-title');
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
    this.signInButton = page.getByTestId('register-login-link');
  }

  async register({ username, email, password, firstName, lastName }: RegisterDto) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.submitButton.click();
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Create your account');
    await expect(this.usernameInput).toBeVisible();
  }
}
