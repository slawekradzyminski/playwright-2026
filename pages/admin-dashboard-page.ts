import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import type { ProductDto } from '../types/product';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class AdminDashboardPage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/admin', 'admin-dashboard-page');
    this.header = new AuthenticatedHeader(page);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
  async expectLowStockProduct(product: ProductDto) {
    await expect(this.root.getByTestId(`admin-dashboard-product-name-${product.id}`)).toHaveText(product.name);
    await expect(this.root.getByTestId(`admin-dashboard-product-stock-${product.id}`)).toHaveText(`${product.stockQuantity} in stock`);
  }
  async editLowStockProduct(id: number) { await this.root.getByTestId(`admin-dashboard-product-update-${id}`).click(); }
  async expectClientDenied() {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}/`);
    await expect(this.root).toHaveCount(0);
  }

}
