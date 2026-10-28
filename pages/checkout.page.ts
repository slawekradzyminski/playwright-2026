import type { Locator, Page } from '@playwright/test';
import type { AddressDto } from '../types/order';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';
  readonly title: Locator;
  readonly total: Locator;
  readonly submitButton: Locator;
  readonly availabilityError: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('checkout-title');
    this.total = page.getByTestId('checkout-total-amount');
    this.submitButton = page.getByTestId('checkout-submit-button');
    this.availabilityError = page.getByTestId('checkout-availability-error');
  }

  async goto() { await this.page.goto(this.path); }

  async fillAddress(address: AddressDto) {
    await this.page.getByTestId('checkout-street-input').fill(address.street);
    await this.page.getByTestId('checkout-city-input').fill(address.city);
    await this.page.getByTestId('checkout-state-input').fill(address.state);
    await this.page.getByTestId('checkout-zip-input').fill(address.zipCode);
    await this.page.getByTestId('checkout-country-input').fill(address.country);
  }

  async openWithAddress(address: AddressDto) {
    await this.goto();
    await this.fillAddress(address);
  }

  async placeOrder() { await this.submitButton.click(); }
}
