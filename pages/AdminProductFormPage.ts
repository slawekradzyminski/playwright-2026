import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AdminProductFormData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
}

type ProductFormMode = 'new' | 'edit';

export class AdminProductFormPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly categoryInput: Locator;
  readonly imageInput: Locator;
  readonly submitButton: Locator;
  readonly nameError: Locator;
  readonly priceError: Locator;
  readonly stockError: Locator;
  readonly categoryError: Locator;

  constructor(page: Page, path = '/admin/products/new') {
    super(page, path);
    this.pageRoot = this.byTestId('admin-product-form-page');
    this.title = this.byTestId('admin-product-form-title');
    this.form = this.byTestId('product-form');
    this.nameInput = this.byTestId('product-name-input');
    this.descriptionInput = this.byTestId('product-description-input');
    this.priceInput = this.byTestId('product-price-input');
    this.stockInput = this.byTestId('product-stock-input');
    this.categoryInput = this.byTestId('product-category-input');
    this.imageInput = this.byTestId('product-image-input');
    this.submitButton = this.byTestId('product-submit-button');
    this.nameError = this.byTestId('product-name-error');
    this.priceError = this.byTestId('product-price-error');
    this.stockError = this.byTestId('product-stock-error');
    this.categoryError = this.byTestId('product-category-error');
  }

  static edit(page: Page, productId: number) {
    return new AdminProductFormPage(page, `/admin/products/edit/${productId}`);
  }

  async verifyLoaded(mode: ProductFormMode) {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.form).toBeVisible();
    await expect(this.title).toHaveText(mode === 'new' ? 'Add New Product' : 'Edit Product');
    await expect(this.submitButton).toHaveText(mode === 'new' ? 'Create Product' : 'Update Product');
  }

  async fillProduct(product: AdminProductFormData) {
    await this.nameInput.fill(product.name);
    await this.descriptionInput.fill(product.description);
    await this.priceInput.fill(String(product.price));
    await this.stockInput.fill(String(product.stockQuantity));
    await this.categoryInput.fill(product.category);
    await this.imageInput.fill(product.imageUrl);
  }

  async submit() {
    await this.submitButton.click();
  }

  async verifyRequiredFieldErrors() {
    await expect(this.nameError).toHaveText('Product name is required');
    await expect(this.priceError).toHaveText('Price is required');
    await expect(this.stockError).toHaveText('Stock quantity is required');
    await expect(this.categoryError).toHaveText('Category is required');
  }

  async verifyValues(product: AdminProductFormData) {
    await expect(this.nameInput).toHaveValue(product.name);
    await expect(this.descriptionInput).toHaveValue(product.description);
    await expect(this.priceInput).toHaveValue(String(product.price));
    await expect(this.stockInput).toHaveValue(String(product.stockQuantity));
    await expect(this.categoryInput).toHaveValue(product.category);
    await expect(this.imageInput).toHaveValue(product.imageUrl);
  }
}
