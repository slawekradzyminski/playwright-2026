import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class ProductsPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('products-page');
    this.title = this.root.getByTestId('products-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/products');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Products');
    await expect(this.title).toBeVisible();
  }
}
