import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class ProductsPage {
  readonly page: Page;
  readonly productsPage: Locator;
  readonly title: Locator;
  readonly countSummary: Locator;
  readonly categoriesContainer: Locator;
  readonly productsUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.productsPage = page.getByTestId('products-page');
    this.title = page.getByTestId('products-title');
    this.countSummary = page.getByTestId('products-count-summary');
    this.categoriesContainer = page.getByTestId('products-categories-container');
    this.productsUrl = `${APP_BASE_URL}/products`;
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(this.productsUrl);
    await expect(this.productsPage).toBeVisible();
    await expect(this.title).toHaveText('Products');
    await expect(this.countSummary).toBeVisible();
    await expect(this.categoriesContainer).toBeVisible();
  }
}
