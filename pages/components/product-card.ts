import { expect, type Locator } from '@playwright/test';

export class ProductCard {
  constructor(private readonly root: Locator) {}

  async openDetails() {
    await this.root.getByTestId('product-name').click();
  }

  async increaseQuantity() {
    await this.root.getByTestId('product-increase-quantity').click();
  }

  async saveToCart() {
    await this.root.getByTestId('product-add-button').click();
  }

  async removeFromCart() {
    await this.root.getByTestId('product-remove-button').click();
  }

  async expectInCart(quantity: number) {
    await expect(this.root.getByText(`${quantity} in cart`, { exact: true })).toBeVisible();
    await expect(this.root.getByTestId('product-quantity-value')).toHaveText(String(quantity));
    await expect(this.root.getByTestId('product-add-button')).toHaveText('Update Cart');
  }

  async expectNotInCart() {
    await expect(this.root.getByTestId('product-add-button')).toHaveText('Add to Cart');
    await expect(this.root.getByTestId('product-remove-button')).toHaveCount(0);
  }
}
