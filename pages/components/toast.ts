import { expect, type Locator, type Page } from '@playwright/test';

export class Toast {
  private readonly viewport: Locator;

  constructor(page: Page) {
    this.viewport = page.getByTestId('toast-viewport');
  }

  // The outer toast test ID contains a generated suffix. Scope by stable children.
  private notification(message: string) {
    return this.viewport.getByRole('listitem').filter({
      has: this.viewport.page().getByTestId('toast-description').filter({ hasText: message }),
    });
  }

  async expectError(message: string) {
    const notification = this.notification(message);
    await expect(notification).toBeVisible();
    await expect(notification.getByTestId('toast-title')).toHaveText('Error');
    await expect(notification.getByTestId('toast-description')).toHaveText(message);
  }

  async expectSuccess(message: string) {
    const notification = this.notification(message);
    await expect(notification).toBeVisible();
    await expect(notification.getByTestId('toast-title')).toHaveText('Success');
    await expect(notification.getByTestId('toast-description')).toHaveText(message);
  }

  async dismiss(message: string) {
    await this.notification(message).getByTestId('toast-close').click();
  }

  async expectDismissed(message: string) {
    await expect(this.notification(message)).toBeHidden();
  }
}
