import type { Locator, Page } from '@playwright/test';
import type { ProductCreateDto } from '../../types/product';

export class AdminProductFormPage {
  readonly title: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly stock: Locator;
  readonly category: Locator;
  readonly imageUrl: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('admin-product-form-title');
    this.name = page.getByTestId('product-name-input');
    this.description = page.getByTestId('product-description-input');
    this.price = page.getByTestId('product-price-input');
    this.stock = page.getByTestId('product-stock-input');
    this.category = page.getByTestId('product-category-input');
    this.imageUrl = page.getByTestId('product-image-input');
    this.submitButton = page.getByTestId('product-submit-button');
  }

  async gotoNew() { await this.page.goto('/admin/products/new'); }

  async fill(product: ProductCreateDto) {
    await this.name.fill(product.name);
    await this.description.fill(product.description);
    await this.price.fill(product.price.toFixed(2));
    await this.stock.fill(String(product.stockQuantity));
    await this.category.fill(product.category);
    await this.imageUrl.fill(product.imageUrl ?? '');
  }

  async save() { await this.submitButton.click(); }
}
