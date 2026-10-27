import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { LoggedOutHeader } from './components/logged-out-header.component';
import { Toast } from './components/toast.component';

export class LoginPage extends BasePage {
  protected readonly path = '/login';
  readonly header: LoggedOutHeader;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly toast: Toast;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedOutHeader(page);
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.usernameError = page.getByTestId('login-username-error');
    this.passwordError = page.getByTestId('login-password-error');
    this.toast = new Toast(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async openRegistration(): Promise<void> {
    await this.page.getByTestId('login-register-link').click();
  }
}
