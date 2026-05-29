import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { BasePage } from './BasePage';

const RESET_REQUEST_TOAST_TITLE = 'Check your email';
const RESET_REQUEST_TOAST_MESSAGE = 'If the account exists, we sent password reset instructions.';

export class ForgotPasswordPage extends BasePage {
  readonly toast: ToastAlert;
  readonly forgotPage: Locator;
  readonly title: Locator;
  readonly identifierInput: Locator;
  readonly identifierError: Locator;
  readonly submitButton: Locator;
  readonly developerTokenValue: Locator;
  readonly backToLoginButton: Locator;

  constructor(page: Page) {
    super(page, '/forgot-password');
    this.toast = new ToastAlert(page);
    this.forgotPage = this.byTestId('forgot-page');
    this.title = this.byTestId('forgot-title');
    this.identifierInput = this.byTestId('forgot-identifier-input');
    this.identifierError = this.byTestId('forgot-identifier-error');
    this.submitButton = this.byTestId('forgot-submit-button');
    this.developerTokenValue = this.byTestId('forgot-token-value');
    this.backToLoginButton = this.byTestId('forgot-back-to-login');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.forgotPage).toBeVisible();
    await expect(this.title).toHaveText('Forgot password');
    await expect(this.identifierInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.backToLoginButton).toBeVisible();
  }

  async requestReset(identifier: string) {
    await this.identifierInput.fill(identifier);
    await this.submitButton.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async verifyRequiredIdentifierError() {
    await expect(this.identifierError).toHaveText('Username or email is required');
  }

  async verifyResetRequestAccepted() {
    await this.toast.verifyAlert(RESET_REQUEST_TOAST_TITLE, RESET_REQUEST_TOAST_MESSAGE);
  }

  async verifyDeveloperTokenVisible() {
    await expect(this.developerTokenValue).toBeVisible();
    await expect(this.developerTokenValue).not.toHaveValue('');
  }

  async verifyNoToast() {
    await expect(this.toast.viewport).toBeEmpty();
  }
}
