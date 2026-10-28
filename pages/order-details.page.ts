import { expect, type Locator, type Page } from '@playwright/test';
import type { AddressDto } from '../types/order';
import { Toast } from './components/toast.component';

export class OrderDetailsPage {
  readonly toast: Toast;
  readonly title: Locator;
  readonly status: Locator;
  readonly total: Locator;
  readonly items: Locator;
  readonly street: Locator;
  readonly cityStateZip: Locator;
  readonly country: Locator;
  readonly cancelButton: Locator;
  readonly statusSelect: Locator;
  readonly updateStatusButton: Locator;

  constructor(private readonly page: Page) {
    this.toast = new Toast(page);
    this.title = page.getByTestId('order-details-title');
    this.status = page.getByTestId('order-details-status');
    this.total = page.getByTestId('order-details-total-amount');
    this.items = page.getByTestId('order-details-items-list');
    this.street = page.getByTestId('order-details-address-street');
    this.cityStateZip = page.getByTestId('order-details-address-city-state');
    this.country = page.getByTestId('order-details-address-country');
    this.cancelButton = page.getByTestId('order-details-cancel-button');
    this.statusSelect = page.getByTestId('order-details-status-select');
    this.updateStatusButton = page.getByTestId('order-details-update-status-button');
  }

  async goto(id: number | string) { await this.page.goto(`/orders/${id}`); }

  async expectShippingAddress(address: AddressDto) {
    await expect(this.street).toHaveText(address.street);
    await expect(this.cityStateZip).toHaveText(`${address.city}, ${address.state} ${address.zipCode}`);
    await expect(this.country).toHaveText(address.country);
  }

  async cancelWithConfirmation() {
    this.page.once('dialog', dialog => dialog.accept());
    await this.cancelButton.click();
  }

  async changeStatus(label: string) {
    await this.statusSelect.selectOption({ label });
    await this.updateStatusButton.click();
  }
}
