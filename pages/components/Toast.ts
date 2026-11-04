import { expect, type Locator, type Page } from '@playwright/test';

export class Toast {
  readonly root: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('toast-viewport').getByRole('listitem').last();
    this.title = this.root.getByTestId('toast-title');
    this.description = this.root.getByTestId('toast-description');
    this.closeButton = this.root.getByTestId('toast-close');
  }

  async expectToast(title: string, description: string) {
    await expect(this.title).toHaveText(title);
    await expect(this.description).toHaveText(description);
  }

  async expectError(description: string) {
    await this.expectToast('Error', description);
  }

  async close() {
    await this.closeButton.click();
    await expect(this.root).toBeHidden();
  }
}
