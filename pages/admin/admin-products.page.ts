import type { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class AdminProductsPage extends BasePage {
  protected readonly path = '/admin/products';

  constructor(page: Page) {
    super(page);
  }

  async goto() { await this.page.goto(this.path); }
  row(id: number | string) { return this.page.getByTestId(`admin-product-row-${id}`); }
  name(id: number | string) { return this.page.getByTestId(`admin-product-name-${id}`); }
  price(id: number | string) { return this.page.getByTestId(`admin-product-price-${id}`); }
  stock(id: number | string) { return this.page.getByTestId(`admin-product-stock-${id}`); }
  async edit(id: number | string) { await this.page.getByTestId(`admin-product-edit-${id}`).click(); }
  async deleteWithConfirmation(id: number | string) {
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.getByTestId(`admin-product-delete-${id}`).click();
  }
}
