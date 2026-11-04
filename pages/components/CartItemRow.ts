import type { Locator, Page } from '@playwright/test';

/** One row of the cart table; every test id in the row ends with the product id. */
export class CartItemRow {
  readonly root: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly decreaseButton: Locator;
  readonly increaseButton: Locator;
  readonly quantity: Locator;
  /** Shown only while the displayed quantity differs from the saved one; the change is sent to the API on click. */
  readonly updateButton: Locator;
  readonly total: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, productId: number) {
    this.root = page.getByTestId(`cart-item-${productId}`);
    this.name = this.root.getByTestId(`cart-item-name-${productId}`);
    this.price = this.root.getByTestId(`cart-item-price-${productId}`);
    this.decreaseButton = this.root.getByTestId(`cart-item-decrease-${productId}`);
    this.increaseButton = this.root.getByTestId(`cart-item-increase-${productId}`);
    this.quantity = this.root.getByTestId(`cart-item-quantity-${productId}`);
    this.updateButton = this.root.getByTestId(`cart-item-update-${productId}`);
    this.total = this.root.getByTestId(`cart-item-total-${productId}`);
    this.removeButton = this.root.getByTestId(`cart-item-remove-${productId}`);
  }

  async increaseQuantity(times: number) {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.click();
    }
  }
}
