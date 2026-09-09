import type { ProductDto } from '../types/product';
import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class AdminDashboardPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly metrics: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('admin-dashboard-page');
    this.title = this.root.getByTestId('admin-dashboard-title');
    this.metrics = this.root.getByTestId('admin-dashboard-metrics');
  }

  get productsCount() { return this.root.getByTestId('admin-dashboard-products-count'); }
  get ordersCount() { return this.root.getByTestId('admin-dashboard-orders-count'); }
  get pendingCount() { return this.root.getByTestId('admin-dashboard-pending-count'); }
  get revenue() { return this.root.getByTestId('admin-dashboard-revenue-amount'); }

  async goto() {
    await this.page.goto('/admin');
    await this.assertLoaded();
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/admin');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Admin Dashboard');
    await expect(this.title).toBeVisible();
    await expect(this.metrics).toBeVisible();
  }

  async assertCatalogSummary(products: ProductDto[]) {
    await expect(this.productsCount).toHaveText(String(products.length));
    const lowStock = products.filter(product => product.stockQuantity < 5);
    await expect(this.root.locator('[data-testid^="admin-dashboard-product-name-"]')).toHaveCount(lowStock.length);
    for (const product of lowStock) {
      await expect(this.root.getByTestId(`admin-dashboard-product-name-${product.id}`)).toHaveText(product.name);
      await expect(this.root.getByTestId(`admin-dashboard-product-stock-${product.id}`)).toHaveText(`${product.stockQuantity} in stock`);
    }
  }

  async assertOrderMetrics(expected: { orders: number; pending: number; revenue: number }) {
    await expect(this.ordersCount).toHaveText(String(expected.orders));
    await expect(this.pendingCount).toHaveText(String(expected.pending));
    await expect(this.revenue).toHaveText(`$${expected.revenue.toFixed(2)}`);
  }

  async assertRecentOrders(ids: number[]) {
    await expect(this.root.locator('[data-testid^="admin-dashboard-order-id-"]')).toHaveText(ids.map(id => `Order #${id}`));
  }

  async assertManagementLinks() {
    await expect(this.root.getByTestId('admin-dashboard-orders-link')).toHaveAttribute('href', '/admin/orders');
    await expect(this.root.getByTestId('admin-dashboard-manage-inventory')).toHaveAttribute('href', '/admin/inventory');
  }

  async assertEmptyPanels() {
    await expect(this.root.getByTestId('admin-dashboard-no-orders')).toBeVisible();
    await expect(this.root.getByTestId('admin-dashboard-no-low-stock')).toBeVisible();
  }
}
