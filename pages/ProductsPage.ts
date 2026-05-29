import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productsPage: Locator;
  readonly title: Locator;
  readonly countSummary: Locator;
  readonly categoriesContainer: Locator;

  constructor(page: Page) {
    super(page, '/products');
    this.productsPage = this.byTestId('products-page');
    this.title = this.byTestId('products-title');
    this.countSummary = this.byTestId('products-count-summary');
    this.categoriesContainer = this.byTestId('products-categories-container');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.productsPage).toBeVisible();
    await expect(this.title).toHaveText('Products');
    await expect(this.countSummary).toBeVisible();
    await expect(this.categoriesContainer).toBeVisible();
  }
}
