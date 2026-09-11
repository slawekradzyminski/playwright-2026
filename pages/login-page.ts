import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { LoginDto } from '../types/auth';
import { BasePage } from './base-page';
import { LoggedOutHeader } from './components/logged-out-header';
import { Toast } from './components/toast';

export class LoginPage extends BasePage {
  readonly header: LoggedOutHeader;
  readonly toast: Toast;
  private readonly username;
  private readonly password;
  private readonly submitButton;

  constructor(page: Page) {
    super(page, '/login', 'login-page');
    this.header = new LoggedOutHeader(page);
    this.toast = new Toast(page);
    this.username = this.root.getByTestId('login-username-input');
    this.password = this.root.getByTestId('login-password-input');
    this.submitButton = this.root.getByTestId('login-submit-button');
  }

  async fillCredentials(credentials: LoginDto) {
    await this.username.fill(credentials.username);
    await this.password.fill(credentials.password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async signIn(credentials: LoginDto) {
    await this.fillCredentials(credentials);
    await this.submit();
  }

  async goToRegister() {
    await this.root.getByTestId('login-register-link').click();
  }

  async goToPasswordRecovery() {
    await this.root.getByTestId('login-forgot-link').click();
  }

  async expectRequiredCredentials() {
    await expect(this.root.getByTestId('login-username-error')).toHaveText('Username is required');
    await expect(this.root.getByTestId('login-password-error')).toHaveText('Password is required');
  }

}
