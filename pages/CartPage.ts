import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('cart-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Your Cart');
  }
}
