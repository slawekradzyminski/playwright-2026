import { expect, type Locator, type Page } from '@playwright/test';

export class Toast {
  private readonly description: Locator;

  constructor(page: Page) {
    this.description = page.getByTestId('toast-viewport').getByTestId('toast-description');
  }

  async expectDescription(text: string): Promise<void> {
    await expect(this.description).toHaveText(text);
  }
}
