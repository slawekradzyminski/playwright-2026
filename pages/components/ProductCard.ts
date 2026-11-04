import { expect, type Locator } from '@playwright/test';

/** One product tile on the product list. */
export class ProductCard {
  readonly name: Locator;
  readonly image: Locator;
  readonly price: Locator;
  readonly category: Locator;
  readonly description: Locator;
  readonly decreaseButton: Locator;
  readonly increaseButton: Locator;
  readonly quantity: Locator;
  /** "N in cart", shown only when the product is already in the cart. */
  readonly cartQuantity: Locator;
  /** "Add to Cart", or "Update Cart" when the product is already in the cart. */
  readonly addButton: Locator;
  readonly removeButton: Locator;

  constructor(readonly root: Locator) {
    this.name = root.getByTestId('product-name');
    this.image = root.getByTestId('product-image');
    this.price = root.getByTestId('product-price');
    this.category = root.getByTestId('product-category');
    this.description = root.getByTestId('product-description');
    this.decreaseButton = root.getByTestId('product-decrease-quantity');
    this.increaseButton = root.getByTestId('product-increase-quantity');
    this.quantity = root.getByTestId('product-quantity-value');
    this.cartQuantity = root.getByTestId('product-card-cart-quantity');
    this.addButton = root.getByTestId('product-add-button');
    this.removeButton = root.getByTestId('product-remove-button');
  }

  async expectInCart(quantity: number) {
    await expect(this.cartQuantity).toHaveText(`${quantity} in cart`);
    await expect(this.addButton).toHaveText('Update Cart');
  }

  async expectNotInCart() {
    await expect(this.cartQuantity).toBeHidden();
    await expect(this.addButton).toHaveText('Add to Cart');
  }

  async increaseQuantity(times: number) {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.click();
    }
  }
}
