import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  protected readonly path = '/profile';
  readonly title: Locator;

  // Personal details
  readonly email: Locator;
  readonly emailError: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly saveDetails: Locator;

  // System prompts
  readonly prompt: Locator;
  readonly savePrompt: Locator;
  readonly toolPrompt: Locator;
  readonly saveToolPrompt: Locator;

  // Two-factor authentication
  readonly mfaStatus: Locator;
  readonly mfaEnable: Locator;
  readonly mfaKey: Locator;
  readonly mfaCode: Locator;
  readonly mfaConfirm: Locator;
  readonly mfaRecoveryCodes: Locator;
  readonly mfaRecoveryCount: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('profile-title');

    this.email = page.getByTestId('user-edit-email-input');
    this.emailError = page.getByTestId('user-edit-email-error');
    this.firstName = page.getByTestId('user-edit-firstName-input');
    this.lastName = page.getByTestId('user-edit-lastName-input');
    this.saveDetails = page.getByTestId('user-edit-submit');

    this.prompt = page.getByTestId('profile-prompt-input');
    this.savePrompt = page.getByTestId('profile-prompt-submit');
    this.toolPrompt = page.getByTestId('profile-tool-prompt-input');
    this.saveToolPrompt = page.getByTestId('profile-tool-prompt-submit');

    this.mfaStatus = page.getByTestId('mfa-status-badge');
    this.mfaEnable = page.getByTestId('mfa-enable-button');
    this.mfaKey = page.getByTestId('mfa-manual-key');
    this.mfaCode = page.getByTestId('mfa-confirm-code');
    this.mfaConfirm = page.getByTestId('mfa-confirm-button');
    this.mfaRecoveryCodes = page.getByTestId('mfa-recovery-codes');
    this.mfaRecoveryCount = page.getByTestId('mfa-recovery-count');
  }

  /** Starts authenticator setup and returns the manual key shown next to the QR code. */
  async startMfaSetup(): Promise<string> {
    await this.mfaEnable.click();
    return this.mfaKey.inputValue();
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Profile');
  }
}
