import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async expectUrl(): Promise<void> {
    await expect(this.page).toHaveURL(this.path);
  }
}
