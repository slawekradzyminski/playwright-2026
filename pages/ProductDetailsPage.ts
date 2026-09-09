import { expect, type Page, type Locator } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class ProductDetailsPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly stock: Locator;
  readonly add: Locator;
  readonly back: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('product-details');
    this.title = this.root.getByTestId('product-title');
    this.description = this.root.getByTestId('product-description');
    this.category = this.root.getByTestId('product-category');
    this.price = this.root.getByTestId('product-price');
    this.stock = this.root.getByTestId('product-stock');
    this.add = this.root.getByTestId('add-to-cart');
    this.back = page.getByRole('link', { name: /Back to Products/ });
    this.error = page.getByText('Error loading product details', { exact: true });
  }

  async goto(id: number) {
    await this.page.goto(`/products/${id}`);
  }

  async assertLoaded(id: number) {
    await expect(this.page).toHaveURL(`/products/${id}`);
    await expect(this.root).toBeVisible();
  }
}
