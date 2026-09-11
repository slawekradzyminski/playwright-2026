import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { GetOrdersClient } from '../clients/orders/get-orders-client';
import type { AddressDto } from '../types/commerce';
import type { ProductDto } from '../types/product';

export class CheckoutPage extends BasePage {
  constructor(page: Page) { super(page, '/checkout', 'checkout-page'); }
  async fillAddress(address: AddressDto) {
    for (const [field, value] of Object.entries(address)) {
      await this.root.getByTestId(`checkout-${field === 'zipCode' ? 'zip' : field}-input`).fill(value);
    }
  }
  async submit() { await this.root.getByTestId('checkout-submit-button').click(); }
  async placeOrder(): Promise<number> {
    const response = this.page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/orders' && r.request().method() === 'POST');
    await this.submit();
    return (await (await response).json()).id;
  }
  async expectSummary(product: ProductDto, quantity: number) {
    await expect(this.root.getByTestId(`checkout-item-name-${product.id}`)).toHaveText(product.name);
    await expect(this.root.getByTestId(`checkout-item-quantity-${product.id}`)).toHaveText(String(quantity));
    await expect(this.root.getByTestId('checkout-total-amount')).toHaveText(`$${(product.price * quantity).toFixed(2)}`);
  }
  async expectRequiredAddress() {
    for (const [field, message] of Object.entries({ street: 'Street address is required', city: 'City is required', state: 'State is required', zip: 'ZIP code is required', country: 'Country is required' })) {
      await expect(this.root.getByTestId(`checkout-${field}-error`)).toHaveText(message);
    }
  }
  async expectNoOrders(token: string) {
    const response = await new GetOrdersClient(this.page.request).get(token);
    expect(response.status()).toBe(200);
    expect((await response.json()).totalElements).toBe(0);
  }
  async expectAvailabilityError(message: string) {
    await expect(this.root.getByTestId('checkout-availability-error')).toHaveText(message);
  }
  async expectAddress(address: AddressDto) {
    for (const [field, value] of Object.entries(address)) {
      await expect(this.root.getByTestId(`checkout-${field === 'zipCode' ? 'zip' : field}-input`)).toHaveValue(value);
    }
  }

}
