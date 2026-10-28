import { expect, type Locator, type Page } from '@playwright/test';

type ToastVariant = 'success' | 'error' | 'default';

export class Toast {
  private readonly viewport: Locator;

  constructor(private readonly page: Page) {
    this.viewport = page.getByTestId('toast-viewport');
  }

  async expectSuccess(message: string): Promise<void> {
    await this.expectMessage('success', message);
  }

  async expectFailure(message: string): Promise<void> {
    await this.expectMessage('error', message);
  }

  async expectNotice(message: string): Promise<void> {
    await this.expectMessage('default', message);
  }

  private async expectMessage(variant: ToastVariant, message: string): Promise<void> {
    // ToastProvider exposes its variant through CSS Modules classes, without a data-variant attribute.
    // Match the variant's local class name without depending on the generated hash.
    const toast = this.viewport.locator(`[data-state="open"][class*="_${variant}_"]`);
    const description = toast.getByTestId('toast-description')
      .and(this.page.getByText(message, { exact: true }));

    await expect(description, `Visible ${variant} toast with message: ${message}`).toBeVisible();
  }
}
