import { expect, type Locator, type Page } from '@playwright/test';

export class Toast {
  private readonly content: Locator;

  constructor(private readonly page: Page) {
    this.content = page.getByTestId('toast-content');
  }

  async assertSuccess(message: string) {
    await this.assertMessage('Success', message);
  }

  async assertError(message: string) {
    await this.assertMessage('Error', message);
  }

  private async assertMessage(title: string, message: string) {
    const toast = this.content.filter({
      has: this.page.getByTestId('toast-description').and(this.page.getByText(message, { exact: true }))
    });
    await expect(toast).toBeVisible();
    await expect(toast.getByTestId('toast-title')).toHaveText(title);
    await expect(toast.getByTestId('toast-description')).toHaveText(message);
  }
}
