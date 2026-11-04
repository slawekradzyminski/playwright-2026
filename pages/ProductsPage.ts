import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  protected readonly path = '/products';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('products-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Products');
  }
}
