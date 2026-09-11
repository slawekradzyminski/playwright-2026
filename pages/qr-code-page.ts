import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class QrCodePage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/qr', 'qr-code-page');
    this.header = new AuthenticatedHeader(page);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
}
