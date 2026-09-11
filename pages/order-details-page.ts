import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import { AuthenticatedHeader } from './components/authenticated-header';
import { GetOrderClient } from '../clients/orders/get-order-client';
import type { AddressDto, OrderStatus } from '../types/commerce';
import type { ProductDto } from '../types/product';

export class OrderDetailsPage {
  readonly header: AuthenticatedHeader;
  constructor(private readonly page: Page) { this.header = new AuthenticatedHeader(page); }
  async open(id: number) { await this.page.goto(`${APP_BASE_URL}/orders/${id}`); }
  async reload() { await this.page.reload(); }
  async expectUrl(id: number) { await expect(this.page).toHaveURL(`${APP_BASE_URL}/orders/${id}`); }
  async cancel(confirm: boolean) {
    this.page.once('dialog', dialog => confirm ? dialog.accept() : dialog.dismiss());
    await this.page.getByTestId('order-details-cancel-button').click();
  }
  async changeStatus(status: OrderStatus) {
    await this.page.getByTestId('order-details-status-select').selectOption(status);
    await this.page.getByTestId('order-details-update-status-button').click();
  }
  async expectStatus(status: OrderStatus) { await expect(this.page.getByTestId('order-details-status')).toHaveText(status); }
  async expectCancellationUnavailable() { await expect(this.page.getByTestId('order-details-cancel-button')).toHaveCount(0); }
  async expectClientControls() {
    await expect(this.page.getByTestId('order-details')).toBeVisible();
    await expect(this.page.getByTestId('order-details-admin-controls')).toHaveCount(0);
  }
  async expectOrder(id: number, product: ProductDto, quantity: number, address: AddressDto) {
    await expect(this.page.getByTestId('order-details-title')).toHaveText(`Order #${id}`);
    const item = this.page.getByTestId('order-details-items-list');
    await expect(item.getByTestId(/^order-item-name-/)).toHaveText(product.name);
    await expect(item.getByTestId(/^order-item-price-details-/)).toHaveText(`$${product.price} x ${quantity}`);
    await expect(this.page.getByTestId('order-details-total-amount')).toHaveText(`$${(product.price * quantity).toFixed(2)}`);
    await expect(this.page.getByTestId('order-details-address-street')).toHaveText(address.street);
    await expect(this.page.getByTestId('order-details-address-city-state')).toHaveText(`${address.city}, ${address.state} ${address.zipCode}`);
    await expect(this.page.getByTestId('order-details-address-country')).toHaveText(address.country);
  }
  async expectPersisted(id: number, token: string, expected: { status: OrderStatus; username?: string; totalAmount?: number; shippingAddress?: AddressDto }) {
    await expect.poll(async () => {
      const response = await new GetOrderClient(this.page.request).get(id, token);
      expect(response.status()).toBe(200);
      return await response.json();
    }).toMatchObject(expected);
  }
}
