import type { Locator, Page } from '@playwright/test';

export class ProductCard {
  readonly root: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly category: Locator;
  readonly quantity: Locator;
  readonly inCart: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, name: string) {
    this.root = page.getByTestId('product-item').filter({
      has: page.getByRole('heading', { name, exact: true }),
    });
    this.name = this.root.getByTestId('product-name');
    this.description = this.root.getByTestId('product-description');
    this.price = this.root.getByTestId('product-price');
    this.category = this.root.getByTestId('product-category');
    this.quantity = this.root.getByTestId('product-quantity-value');
    this.inCart = this.root.getByTestId('product-card-cart-quantity');
    this.addButton = this.root.getByTestId('product-add-button');
    this.removeButton = this.root.getByTestId('product-remove-button');
  }

  async increaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) await this.root.getByTestId('product-increase-quantity').click();
  }

  async decreaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) await this.root.getByTestId('product-decrease-quantity').click();
  }

  async saveToCart() { await this.addButton.click(); }
  async removeFromCart() { await this.removeButton.click(); }
}
