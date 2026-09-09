import type { ProductFormValues } from './AdminProductFormPage';
import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class AdminProductsPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly addNew: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('admin-products-page');
    this.title = this.root.getByTestId('admin-product-list-title');
    this.addNew = this.root.getByTestId('admin-product-list-add-new');
  }

  async goto() {
    await this.page.goto('/admin/products');
    await this.assertLoaded();
  }

  row(id: number) { return this.root.getByTestId(`admin-product-row-${id}`); }
  name(id: number) { return this.root.getByTestId(`admin-product-name-${id}`); }
  edit(id: number) { return this.root.getByTestId(`admin-product-edit-${id}`); }
  remove(id: number) { return this.root.getByTestId(`admin-product-delete-${id}`); }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/admin/products');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Manage Products');
  }

  async openFromAdminNavigation() {
    await this.page.getByTestId('admin-section-products').click();
    await this.assertLoaded();
  }

  async assertProduct(id: number, product: Pick<ProductFormValues, 'name' | 'price' | 'stock' | 'category'>) {
    await expect(this.name(id)).toHaveText(product.name);
    await expect(this.row(id).getByTestId(`admin-product-price-${id}`)).toHaveText(`$${product.price}`);
    await expect(this.row(id).getByTestId(`admin-product-stock-${id}`)).toHaveText(product.stock);
    await expect(this.row(id).getByTestId(`admin-product-category-${id}`)).toHaveText(product.category);
  }

  async requestDeletion(id: number, confirmation: 'accept' | 'dismiss') {
    this.page.once('dialog', dialog => dialog[confirmation]());
    await this.remove(id).click();
  }
}
