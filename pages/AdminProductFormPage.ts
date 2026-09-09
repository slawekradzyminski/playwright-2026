import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export type ProductFormValues = { name: string; description: string; price: string; stock: string; category: string };

export class AdminProductFormPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly stock: Locator;
  readonly category: Locator;
  readonly image: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('admin-product-form-page');
    this.title = this.root.getByTestId('admin-product-form-title');
    this.name = this.root.getByTestId('product-name-input');
    this.description = this.root.getByTestId('product-description-input');
    this.price = this.root.getByTestId('product-price-input');
    this.stock = this.root.getByTestId('product-stock-input');
    this.category = this.root.getByTestId('product-category-input');
    this.image = this.root.getByTestId('product-image-input');
    this.submit = this.root.getByTestId('product-submit-button');
  }

  async assertLoaded(mode: 'create' | 'edit') {
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText(mode === 'create' ? 'Add New Product' : 'Edit Product');
  }

  async fillProduct(product: ProductFormValues) {
    await this.name.fill(product.name);
    await this.description.fill(product.description);
    await this.price.fill(product.price);
    await this.stock.fill(product.stock);
    await this.category.fill(product.category);
  }

  async assertProduct(product: ProductFormValues) {
    await expect(this.name).toHaveValue(product.name);
    await expect(this.description).toHaveValue(product.description);
    await expect(this.price).toHaveValue(product.price);
    await expect(this.stock).toHaveValue(product.stock);
    await expect(this.category).toHaveValue(product.category);
  }

  async assertRequiredFieldErrors() {
    for (const message of ['Product name is required', 'Price is required', 'Stock quantity is required', 'Category is required']) {
      await expect(this.root).toContainText(message);
    }
  }

  async saveChanges() {
    const saved = this.page.waitForResponse(response => /\/api\/v1\/products\/\d+$/.test(response.url()) && response.request().method() === 'PUT');
    await this.submit.click();
    expect((await saved).status()).toBe(200);
  }
}
