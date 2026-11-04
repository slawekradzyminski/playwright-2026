import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class QrCodePage extends BasePage {
  protected readonly path = '/qr';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('qr-code-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('QR Code Generator');
  }
}
