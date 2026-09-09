import type { ProductDto } from '../types/product';
import type { AddressDto, OrderDto } from '../types/order';
import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class OrderDetailsPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly status: Locator;
  readonly cancelButton: Locator;
  readonly adminControls: Locator;
  readonly statusSelect: Locator;
  readonly updateStatusButton: Locator;
  readonly notFound: Locator;
  readonly total: Locator;
  readonly shippingStreet: Locator;
  readonly shippingCityStateZip: Locator;
  readonly shippingCountry: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('order-details');
    this.title = this.root.getByTestId('order-details-title');
    this.status = this.root.getByTestId('order-details-status');
    this.cancelButton = this.root.getByTestId('order-details-cancel-button');
    this.adminControls = this.root.getByTestId('order-details-admin-controls');
    this.statusSelect = this.root.getByTestId('order-details-status-select');
    this.updateStatusButton = this.root.getByTestId('order-details-update-status-button');
    this.notFound = page.getByTestId('order-details-not-found');
    this.total = this.root.getByTestId('order-details-total-amount');
    this.shippingStreet = this.root.getByTestId('order-details-address-street');
    this.shippingCityStateZip = this.root.getByTestId('order-details-address-city-state');
    this.shippingCountry = this.root.getByTestId('order-details-address-country');
  }

  async goto(id: number | string) {
    await this.page.goto(`/orders/${id}`);
  }

  async assertLoaded(id: number | string) {
    await expect(this.page).toHaveURL(`/orders/${id}`);
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText(`Order #${id}`);
  }

  itemName(id: number) { return this.root.getByTestId(`order-item-name-${id}`); }
  itemPriceDetails(id: number) { return this.root.getByTestId(`order-item-price-details-${id}`); }
  itemTotal(id: number) { return this.root.getByTestId(`order-item-total-${id}`); }

  async assertContents(order: OrderDto, expected: {
    items: { product: Pick<ProductDto, 'id' | 'name' | 'price'>; quantity: number; total: number }[];
    total: number;
    address: AddressDto;
  }) {
    expect(order.items).toHaveLength(expected.items.length);
    await expect(this.root.locator('[data-testid^="order-item-name-"]')).toHaveCount(expected.items.length);
    for (const item of expected.items) {
      const savedItem = order.items.find(saved => saved.productId === item.product.id);
      expect(savedItem, `Order contains product ${item.product.id}`).toBeDefined();
      const id = savedItem!.id;
      await expect(this.itemName(id)).toHaveText(item.product.name);
      await expect(this.itemPriceDetails(id)).toHaveText(`$${item.product.price.toFixed(2)} x ${item.quantity}`);
      await expect(this.itemTotal(id)).toHaveText(`$${item.total.toFixed(2)}`);
    }
    await expect(this.total).toHaveText(`$${expected.total.toFixed(2)}`);
    await expect(this.shippingStreet).toHaveText(expected.address.street);
    await expect(this.shippingCityStateZip).toHaveText(`${expected.address.city}, ${expected.address.state} ${expected.address.zipCode}`);
    await expect(this.shippingCountry).toHaveText(expected.address.country);
  }

  async requestCancellation(confirmation: 'accept' | 'dismiss') {
    this.page.once('dialog', dialog => dialog[confirmation]());
    await this.cancelButton.press('Enter');
  }

  async assertNotFound() {
    // Failed detail queries retry before the final not-found state is rendered.
    await expect(this.notFound).toHaveText('Order not found', { timeout: 15_000 });
  }

  async assertSensitiveDetailsHidden(values: string[]) {
    await expect(this.root).toHaveCount(0);
    await expect(this.adminControls).toHaveCount(0);
    for (const value of values) {
      await expect(this.page.getByRole('main')).not.toContainText(value);
    }
  }
}
