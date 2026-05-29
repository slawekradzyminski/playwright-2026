import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { APP_BASE_URL } from '../config/constants';
import { BasePage } from './BasePage';

export class ResetPasswordPage extends BasePage {
  readonly toast: ToastAlert;
  readonly resetPage: Locator;
  readonly title: Locator;
  readonly tokenInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly tokenError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly submitButton: Locator;
  readonly backToLoginButton: Locator;

  constructor(page: Page) {
    super(page, '/reset');
    this.toast = new ToastAlert(page);
    this.resetPage = this.byTestId('reset-page');
    this.title = this.byTestId('reset-title');
    this.tokenInput = this.byTestId('reset-token-input');
    this.passwordInput = this.byTestId('reset-password-input');
    this.confirmPasswordInput = this.byTestId('reset-confirm-password-input');
    this.tokenError = this.byTestId('reset-token-error');
    this.passwordError = this.byTestId('reset-password-error');
    this.confirmPasswordError = this.byTestId('reset-confirm-password-error');
    this.submitButton = this.byTestId('reset-submit-button');
    this.backToLoginButton = this.byTestId('reset-back-to-login');
  }

  async gotoWithToken(token: string) {
    await this.page.goto(`${APP_BASE_URL}${this.path}?token=${encodeURIComponent(token)}`);
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(url => url.toString().startsWith(`${APP_BASE_URL}${this.path}`));
    await expect(this.resetPage).toBeVisible();
    await expect(this.title).toHaveText('Reset password');
    await expect(this.tokenInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.backToLoginButton).toBeVisible();
  }

  async resetPassword(token: string, password: string, confirmPassword = password) {
    await this.tokenInput.fill(token);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async verifyTokenPrefilled(token: string) {
    await expect(this.tokenInput).toHaveValue(token);
  }

  async verifyRequiredFieldErrors() {
    await expect(this.tokenError).toHaveText('Token is required');
    await expect(this.passwordError).toHaveText('Password must be at least 8 characters');
    await expect(this.confirmPasswordError).toHaveText('Password must be at least 8 characters');
  }

  async verifyInvalidTokenToast() {
    await this.toast.verifyAlert('Reset failed', 'Invalid password reset token');
  }
}
