import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AdminProductListRow {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  category: string;
}

export class AdminProductsPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly addNewProductLink: Locator;
  readonly table: Locator;
  readonly productRows: Locator;
  readonly productEditLinks: Locator;
  readonly productDeleteButtons: Locator;

  constructor(page: Page) {
    super(page, '/admin/products');
    this.pageRoot = this.byTestId('admin-products-page');
    this.title = this.byTestId('admin-product-list-title');
    this.addNewProductLink = this.byTestId('admin-product-list-add-new');
    this.table = this.byTestId('admin-product-list-table');
    this.productRows = this.page.locator('[data-testid^="admin-product-row-"]');
    this.productEditLinks = this.page.locator('[data-testid^="admin-product-edit-"]');
    this.productDeleteButtons = this.page.locator('[data-testid^="admin-product-delete-"]');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.title).toHaveText('Manage Products');
    await expect(this.addNewProductLink).toBeVisible();
    await expect(this.table).toBeVisible();
    await expect(this.productRows.first()).toBeVisible();
    await expect(this.productRows).not.toHaveCount(0);
    await expect(this.productEditLinks.first()).toBeVisible();
    await expect(this.productDeleteButtons.first()).toBeVisible();
  }

  productRowByName(name: string) {
    return this.productRows.filter({ has: this.page.locator('[data-testid^="admin-product-name-"]', { hasText: name }) });
  }

  async verifyProductListed(product: Omit<AdminProductListRow, 'id'>) {
    const row = this.productRowByName(product.name);

    await expect(row).toBeVisible();
    const productId = await this.getProductIdFromRow(row);
    await expect(this.byTestId(`admin-product-name-${productId}`)).toHaveText(product.name);
    await expect(this.byTestId(`admin-product-price-${productId}`)).toHaveText(this.formatPrice(product.price));
    await expect(this.byTestId(`admin-product-stock-${productId}`)).toHaveText(String(product.stockQuantity));
    await expect(this.byTestId(`admin-product-category-${productId}`)).toHaveText(product.category);
  }

  async productIdByName(name: string) {
    return this.getProductIdFromRow(this.productRowByName(name));
  }

  async editProduct(name: string) {
    const productId = await this.productIdByName(name);

    await this.byTestId(`admin-product-edit-${productId}`).click();
    return productId;
  }

  async deleteProduct(name: string) {
    const productId = await this.productIdByName(name);

    this.page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Are you sure you want to delete this product?');
      await dialog.accept();
    });

    await this.byTestId(`admin-product-delete-${productId}`).click();
    await expect(this.byTestId(`admin-product-row-${productId}`)).toBeHidden();
  }

  async verifyProductNotListed(name: string) {
    await expect(this.productRowByName(name)).toHaveCount(0);
  }

  private async getProductIdFromRow(row: Locator) {
    const testId = await row.first().getAttribute('data-testid');
    const productId = Number(testId?.replace('admin-product-row-', ''));

    expect(productId, `Expected product row test id, got ${testId}`).not.toBeNaN();

    return productId;
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
