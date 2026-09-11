import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import { BasePage } from './base-page';
import { GetProductByIdClient } from '../clients/products/get-product-by-id-client';
import type { ProductDto } from '../types/product';

export class AdminProductsPage extends BasePage {
  constructor(page: Page) { super(page, '/admin/products', 'admin-products-page'); }
  async expectProduct(product: ProductDto) {
    await expect(this.root.getByTestId(`admin-product-name-${product.id}`)).toHaveText(product.name);
    await expect(this.root.getByTestId(`admin-product-price-${product.id}`)).toHaveText(`$${product.price.toFixed(2)}`);
    await expect(this.root.getByTestId(`admin-product-stock-${product.id}`)).toHaveText(String(product.stockQuantity));
    await expect(this.root.getByTestId(`admin-product-category-${product.id}`)).toHaveText(product.category);
  }
  async edit(id: number) { await this.root.getByTestId(`admin-product-edit-${id}`).click(); }
  async remove(id: number, confirm: boolean) {
    this.page.once('dialog', dialog => confirm ? dialog.accept() : dialog.dismiss());
    await this.root.getByTestId(`admin-product-delete-${id}`).click();
  }
  async expectRemoved(id: number, token: string) {
    await expect(this.root.getByTestId(`admin-product-row-${id}`)).toHaveCount(0);
    expect((await new GetProductByIdClient(this.page.request).get(id, token)).status()).toBe(404);
  }
  async expectClientDenied() {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}/`);
    await expect(this.root).toHaveCount(0);
  }

}
