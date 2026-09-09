import { expect, type Page } from '@playwright/test';

export class LlmSettings {
  constructor(private readonly page: Page, private readonly prefix: 'generate' | 'chat' | 'tool') {}

  async open() {
    await this.page.getByTestId(`${this.prefix}-sidebar-toggle`).click();
    await expect(this.page.getByTestId(`${this.prefix}-sidebar`)).toHaveAttribute('aria-hidden', 'false');
  }

  async close() {
    await this.page.getByTestId(`${this.prefix}-sidebar-toggle`).click();
    await expect(this.page.getByTestId(`${this.prefix}-sidebar`)).toHaveAttribute('aria-hidden', 'true');
  }

  async configure(model: string, think = false) {
    await this.open();
    await this.page.getByTestId('model-input').fill(model);
    await this.page.getByTestId('thinking-checkbox').setChecked(think);
    await this.close();
  }
}
