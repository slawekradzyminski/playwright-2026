import type { OrderStatus } from '../types/order';
import { expect, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class AdminOrdersPage extends LoggedInPage {
  constructor(page: Page) { super(page); }
  get root() { return this.page.getByTestId('admin-order-list'); }
  get status() { return this.root.getByTestId('admin-order-list-status-filter'); }
  get next() { return this.root.getByTestId('admin-order-list-next-page'); }
  get pagination() { return this.root.getByTestId('admin-order-list-pagination-info'); }
  row(id: number) { return this.root.getByTestId(`admin-order-row-${id}`); }
  details(id: number) { return this.root.getByTestId(`admin-order-details-${id}`); }
  async goto() {
    await this.page.goto('/admin/orders');
    await expect(this.root).toBeVisible();
  }
  async findOrder(id: number) {
    for (let page = 0; page < 100; page++) {
      await expect(this.root).toBeVisible();
      if (await this.row(id).count()) return;
      await expect(this.next, `Order ${id} must exist before the last page`).toBeEnabled();
      const previous = await this.pagination.innerText();
      await this.next.click();
      await expect(this.pagination).not.toHaveText(previous);
    }
    throw new Error(`Order ${id} not found within 100 pages`);
  }

  async assertOrderSummary(id: number, expected: { customer: string; total: number }) {
    await expect(this.row(id).getByTestId(`admin-order-customer-${id}`)).toHaveText(expected.customer);
    await expect(this.row(id).getByTestId(`admin-order-amount-${id}`)).toHaveText(`$${expected.total.toFixed(2)}`);
  }

  async assertOnlyStatus(status: OrderStatus) {
    const statuses = this.root.locator('[data-testid^="admin-order-status-cell-"]');
    await expect(statuses.first()).toBeVisible();
    for (const cell of await statuses.all()) await expect(cell).toHaveText(status);
  }
}
