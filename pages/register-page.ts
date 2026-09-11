import { expect, type Page } from '@playwright/test';
import type { UserRegisterDto } from '../types/auth';
import { Toast } from './components/toast';
import { BasePage } from './base-page';
import { LoggedOutHeader } from './components/logged-out-header';

export class RegisterPage extends BasePage {
  readonly header: LoggedOutHeader;
  readonly toast: Toast;

  constructor(page: Page) {
    super(page, '/register', 'register-page');
    this.header = new LoggedOutHeader(page);
    this.toast = new Toast(page);
  }

  async fillDetails(user: UserRegisterDto) {
    await this.root.getByTestId('register-username-input').fill(user.username);
    await this.root.getByTestId('register-email-input').fill(user.email);
    await this.root.getByTestId('register-password-input').fill(user.password);
    await this.root.getByTestId('register-firstname-input').fill(user.firstName);
    await this.root.getByTestId('register-lastname-input').fill(user.lastName);
  }

  async submit() {
    await this.root.getByTestId('register-submit-button').click();
  }

  async goToLogin() {
    await this.root.getByTestId('register-login-link').click();
  }

  async expectRequiredDetails() {
    await expect(this.root.getByTestId('register-username-error')).toHaveText('Username is required');
    await expect(this.root.getByTestId('register-email-error')).toHaveText('Email is required');
    await expect(this.root.getByTestId('register-password-error')).toHaveText('Password is required');
    await expect(this.root.getByTestId('register-firstname-error')).toHaveText('First name is required');
    await expect(this.root.getByTestId('register-lastname-error')).toHaveText('Last name is required');
  }

  async expectTitle() {
    await expect(this.root.getByTestId('register-title')).toHaveText('Create your account');
  }
}
