import { expect, type Locator, type Page } from '@playwright/test';

export type ShopApi = 'REST' | 'GraphQL';

const VALUES: Record<ShopApi, string> = { REST: 'rest', GraphQL: 'graphql' };

export class CommerceTransportSelector {
  readonly select: Locator;

  constructor(private readonly page: Page) {
    this.select = page.getByRole('combobox', { name: 'Shop API' });
  }

  async choose(api: ShopApi): Promise<void> {
    const value = VALUES[api];
    if (await this.select.inputValue() === value) return;
    await Promise.all([
      this.page.waitForEvent('load'),
      this.select.selectOption(value),
    ]);
    await expect(this.select).toHaveValue(value);
  }
}
