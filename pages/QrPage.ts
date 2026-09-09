import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class QrPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('qr-code-page');
    this.title = this.root.getByTestId('qr-code-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/qr');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('QR Code Generator');
    await expect(this.title).toBeVisible();
  }
}
