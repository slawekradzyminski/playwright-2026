import { expect, type Locator, type Page } from '@playwright/test';
import type { OrderStatus } from '../../types/order';
import { BasePage } from '../base.page';

export class AdminOrdersPage extends BasePage {
  protected readonly path = '/admin/orders';
  readonly title: Locator;
  readonly statusFilter: Locator;
  readonly pageInfo: Locator;
  readonly nextPage: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('admin-order-list-title');
    this.statusFilter = page.getByTestId('admin-order-list-status-filter');
    this.pageInfo = page.getByTestId('admin-order-list-pagination-info');
    this.nextPage = page.getByTestId('admin-order-list-next-page');
  }

  async goto() { await this.page.goto(this.path); }
  async filterByStatus(status: OrderStatus) { await this.statusFilter.selectOption(status); }
  // Orders are listed oldest first, ten per page; move forward until the order's row is shown.
  async showOrder(id: number | string) {
    await expect(this.page.getByTestId(/^admin-order-row-/).first()).toBeVisible();
    while (!(await this.row(id).isVisible()) && await this.nextPage.isEnabled()) {
      const current = await this.pageInfo.textContent();
      await this.nextPage.click();
      await expect(this.pageInfo).not.toHaveText(current ?? '');
    }
  }

  row(id: number | string) { return this.page.getByTestId(`admin-order-row-${id}`); }
  customer(id: number | string) { return this.page.getByTestId(`admin-order-customer-${id}`); }
  amount(id: number | string) { return this.page.getByTestId(`admin-order-amount-${id}`); }
  status(id: number | string) { return this.page.getByTestId(`admin-order-status-${id}`); }
  async openDetails(id: number | string) { await this.page.getByTestId(`admin-order-details-${id}`).click(); }
}
