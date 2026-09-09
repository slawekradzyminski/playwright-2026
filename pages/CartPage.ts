import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class CartPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly total: Locator;
  readonly itemCount: Locator;
  readonly checkoutButton: Locator;
  readonly clearButton: Locator;
  readonly empty: Locator;
  readonly retry: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('cart-page');
    this.title = this.root.getByTestId('cart-title');
    this.total = this.root.getByTestId('cart-summary-total-price');
    this.itemCount = this.root.getByTestId('cart-summary-items-count');
    this.checkoutButton = this.root.getByTestId('cart-checkout-button');
    this.clearButton = this.root.getByTestId('cart-clear-button');
    this.empty = this.root.getByTestId('cart-empty');
    this.retry = page.getByTestId('cart-retry');
    this.error = page.getByTestId('cart-error');
  }

  item(id: number | string) { return this.root.getByTestId(`cart-item-${id}`); }
  quantity(id: number | string) { return this.item(id).getByTestId(`cart-item-quantity-${id}`); }
  lineTotal(id: number | string) { return this.item(id).getByTestId(`cart-item-total-${id}`); }
  increase(id: number | string) { return this.item(id).getByTestId(`cart-item-increase-${id}`); }
  decrease(id: number | string) { return this.item(id).getByTestId(`cart-item-decrease-${id}`); }
  update(id: number | string) { return this.item(id).getByTestId(`cart-item-update-${id}`); }
  remove(id: number | string) { return this.item(id).getByTestId(`cart-item-remove-${id}`); }


  async assertLoaded() {
    await expect(this.page).toHaveURL('/cart');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.title).toBeVisible();
  }

  async increaseQuantity(id: number) {
    await this.increase(id).click();
    await this.update(id).click();
  }

  async decreaseQuantity(id: number) {
    await this.decrease(id).click();
    await this.update(id).click();
  }

  async assertSummary(expected: { items: number; total: number }) {
    await expect(this.itemCount).toHaveText(String(expected.items));
    await expect(this.total).toHaveText(`$${expected.total.toFixed(2)}`);
  }

  async requestClear(confirmation: 'accept' | 'dismiss') {
    this.page.once('dialog', dialog => dialog[confirmation]());
    await this.clearButton.click();
  }
}
