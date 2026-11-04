import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AdminPage extends BasePage {
  protected readonly path = '/admin';
  readonly dashboard: Locator;
  readonly metrics: Locator;
  readonly recentOrders: Locator;
  readonly lowStock: Locator;

  productName(id: number) { return this.page.getByTestId(`admin-dashboard-product-name-${id}`); }
  productStock(id: number) { return this.page.getByTestId(`admin-dashboard-product-stock-${id}`); }

  constructor(page: Page) {
    super(page);
    this.dashboard = page.getByTestId('admin-dashboard');
    this.metrics = page.getByTestId('admin-dashboard-metrics');
    this.recentOrders = page.getByTestId('admin-dashboard-recent-orders');
    this.lowStock = page.getByTestId('admin-dashboard-low-stock');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.dashboard).toBeVisible();
  }
}
