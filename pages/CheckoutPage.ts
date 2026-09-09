import type { AddressDto, OrderDto } from '../types/order';
import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class CheckoutPage extends LoggedInPage {
  readonly root: Locator;
  readonly form: Locator;
  readonly submitButton: Locator;
  readonly availabilityError: Locator;
  readonly total: Locator;
  readonly itemCount: Locator;
  readonly street = this.page.getByTestId('checkout-street-input');
  readonly city = this.page.getByTestId('checkout-city-input');
  readonly state = this.page.getByTestId('checkout-state-input');
  readonly zip = this.page.getByTestId('checkout-zip-input');
  readonly country = this.page.getByTestId('checkout-country-input');

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('checkout-page');
    this.form = this.root.getByTestId('checkout-form');
    this.submitButton = this.root.getByTestId('checkout-submit-button');
    this.total = this.root.getByTestId('checkout-total-value');
    this.itemCount = this.root.getByTestId('checkout-items-value');
    this.availabilityError = this.root.getByTestId('checkout-availability-error');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/checkout');
    await expect(this.root).toBeVisible();
    await expect(this.root.getByTestId('checkout-title')).toHaveText('Checkout');
  }

  error(name: 'street' | 'city' | 'state' | 'zip' | 'country') { return this.form.getByTestId(`checkout-${name}-error`); }
  itemTotal(id: number | string) { return this.root.getByTestId(`checkout-item-total-${id}`); }

  async fillShippingAddress(address: AddressDto) {
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
    await this.zip.fill(address.zipCode);
    await this.country.fill(address.country);
  }

  async assertShippingAddressRequired() {
    const messages = { street: 'Street address is required', city: 'City is required', state: 'State is required', zip: 'ZIP code is required', country: 'Country is required' } as const;
    for (const field of Object.keys(messages) as (keyof typeof messages)[]) {
      await expect(this.error(field)).toHaveText(messages[field]);
    }
  }

  async goto() {
    await this.page.goto('/checkout');
    await this.assertLoaded();
  }

  async submitOrder() {
    const response = this.page.waitForResponse(response => response.url().endsWith('/api/v1/orders') && response.request().method() === 'POST');
    await this.submitButton.click();
    return await response;
  }

  async placeOrder(): Promise<OrderDto> {
    const response = await this.submitOrder();
    expect(response.status()).toBe(201);
    return await response.json() as OrderDto;
  }

  async assertStockConflictPreservesAddress(address: AddressDto) {
    await expect(this.page).toHaveURL('/checkout');
    await expect(this.availabilityError).toContainText('Your cart was preserved');
    await expect(this.street).toHaveValue(address.street);
    await expect(this.city).toHaveValue(address.city);
    await expect(this.state).toHaveValue(address.state);
    await expect(this.zip).toHaveValue(address.zipCode);
    await expect(this.country).toHaveValue(address.country);
  }
}
