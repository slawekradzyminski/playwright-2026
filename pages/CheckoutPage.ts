import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('checkout-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Checkout');
  }
}
