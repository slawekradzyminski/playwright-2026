import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class QrCodePage {
  readonly page: Page;
  readonly qrCodePage: Locator;
  readonly title: Locator;
  readonly generator: Locator;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly clearButton: Locator;
  readonly qrCodeUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.qrCodePage = page.getByTestId('qr-code-page');
    this.title = page.getByTestId('qr-code-title');
    this.generator = page.getByTestId('qr-generator');
    this.textInput = page.getByTestId('qr-text-input');
    this.generateButton = page.getByTestId('qr-generate-button');
    this.clearButton = page.getByTestId('qr-clear-button');
    this.qrCodeUrl = `${APP_BASE_URL}/qr`;
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(this.qrCodeUrl);
    await expect(this.qrCodePage).toBeVisible();
    await expect(this.title).toHaveText('QR Code Generator');
    await expect(this.generator).toBeVisible();
    await expect(this.textInput).toBeVisible();
    await expect(this.generateButton).toBeVisible();
    await expect(this.clearButton).toBeVisible();
  }
}
