import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  protected readonly path: string;
  readonly title: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly stock: Locator;

  constructor(page: Page, productId: number) {
    super(page);
    this.path = `/products/${productId}`;
    this.title = page.getByTestId('product-title');
    this.price = page.getByTestId('product-price');
    this.description = page.getByTestId('product-description');
    this.category = page.getByTestId('product-category');
    this.stock = page.getByTestId('product-stock');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toBeVisible();
  }
}
