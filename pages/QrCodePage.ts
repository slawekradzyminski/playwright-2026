import { expect, type Locator, type Page, type Request } from '@playwright/test';
import { BasePage } from './BasePage';

export class QrCodePage extends BasePage {
  protected readonly path = '/qr';
  readonly title: Locator;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly clearButton: Locator;
  readonly image: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('qr-code-title');
    this.textInput = page.getByTestId('qr-text-input');
    this.generateButton = page.getByTestId('qr-generate-button');
    this.clearButton = page.getByTestId('qr-clear-button');
    this.image = page.getByTestId('qr-code-image');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('QR Code Generator');
  }

  /** Clicks "Generate QR Code" and returns the request sent to the generator endpoint. */
  async generate(): Promise<Request> {
    const [request] = await Promise.all([
      this.page.waitForRequest((request) => request.url().endsWith('/api/v1/qr/create') && request.method() === 'POST'),
      this.generateButton.click(),
    ]);
    return request;
  }

  /** Bytes of the displayed PNG (the image is a blob URL created from the API response). */
  async imageBytes(): Promise<Buffer> {
    await expect(this.image).toBeVisible();
    const base64 = await this.image.evaluate(async (img: HTMLImageElement) => {
      const bytes = new Uint8Array(await (await fetch(img.src)).arrayBuffer());
      return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
    });
    return Buffer.from(base64, 'base64');
  }
}
