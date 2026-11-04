import { expect, type Locator, type Page } from '@playwright/test';

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

  constructor(page: Page, private readonly productId: number) {
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

  async expectItem({ name, price, quantity, total }: { name: string; price: string; quantity: number; total: string }) {
    await expect(this.name).toHaveText(name);
    await expect(this.name).toHaveAttribute('href', `/products/${this.productId}`);
    await expect(this.price).toHaveText(price);
    await expect(this.quantity).toHaveText(String(quantity));
    await expect(this.total).toHaveText(total);
  }

  async increaseQuantity(times: number) {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.click();
    }
  }
}
