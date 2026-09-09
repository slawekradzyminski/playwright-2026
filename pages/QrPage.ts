import { expect, type Locator, type Page } from '@playwright/test';
import jsQR from 'jsqr';
import { LoggedInPage } from './LoggedInPage';
import { Toast } from './components/Toast';

export class QrPage extends LoggedInPage {
  readonly toast: Toast;
  readonly root: Locator;
  readonly title: Locator;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly clearButton: Locator;
  readonly image: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.root = page.getByTestId('qr-code-page');
    this.title = this.root.getByTestId('qr-code-title');
    this.textInput = this.root.getByTestId('qr-text-input');
    this.generateButton = this.root.getByTestId('qr-generate-button');
    this.clearButton = this.root.getByTestId('qr-clear-button');
    this.image = this.root.getByTestId('qr-code-image');
  }

  async goto() {
    await this.page.goto('/qr');
    await this.assertLoaded();
  }

  async generate(text: string) {
    await this.textInput.fill(text);
    await this.generateButton.click();
  }

  async assertDecodedText(expected: string) {
    await expect(this.image).toBeVisible();
    await expect.poll(async () => this.image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const pixels = await this.image.evaluate(element => {
      const image = element as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return { width: canvas.width, height: canvas.height, data: Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data) };
    });
    expect(jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data).toBe(expected);
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/qr');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('QR Code Generator');
    await expect(this.title).toBeVisible();
  }
}
