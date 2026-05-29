import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminOrdersPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly statusFilter: Locator;
  readonly paginationInfo: Locator;
  readonly table: Locator;
  readonly orderRows: Locator;
  readonly orderDetailsLinks: Locator;

  constructor(page: Page) {
    super(page, '/admin/orders');
    this.pageRoot = this.byTestId('admin-orders-page');
    this.title = this.byTestId('admin-order-list-title');
    this.statusFilter = this.byTestId('admin-order-list-status-filter');
    this.paginationInfo = this.byTestId('admin-order-list-pagination-info');
    this.table = this.byTestId('admin-order-list-table');
    this.orderRows = this.page.locator('[data-testid^="admin-order-row-"]');
    this.orderDetailsLinks = this.page.locator('[data-testid^="admin-order-details-"]');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.title).toHaveText('Manage Orders');
    await expect(this.statusFilter).toBeVisible();
    await expect(this.paginationInfo).toBeVisible();
    await expect(this.table).toBeVisible();
    await expect(this.orderRows.first()).toBeVisible();
    await expect(this.orderRows).not.toHaveCount(0);
    await expect(this.orderDetailsLinks.first()).toBeVisible();
  }
}
