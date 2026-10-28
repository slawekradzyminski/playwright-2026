import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

// Covers the profile's order history; other profile sections are not modelled yet.
export class ProfilePage extends BasePage {
  protected readonly path = '/profile';
  readonly ordersTitle: Locator;
  readonly ordersError: Locator;
  readonly orderEntries: Locator;

  constructor(page: Page) {
    super(page);
    this.ordersTitle = page.getByTestId('order-list-title');
    this.ordersError = page.getByTestId('order-list-error');
    this.orderEntries = page.getByTestId('order-list-items').locator('[data-testid^="order-id-"]');
  }

  async goto() { await this.page.goto(this.path); }
  order(id: number | string) { return this.page.getByTestId(`order-id-${id}`); }
  orderStatus(id: number | string) { return this.page.getByTestId(`order-status-${id}`); }
  orderTotal(id: number | string) { return this.page.getByTestId(`order-total-${id}`); }
  async openOrder(id: number | string) { await this.page.getByTestId(`order-details-link-${id}`).click(); }
}
