import { type Locator } from '@playwright/test';

export class ProductCard {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly category: Locator;
  readonly noImage: Locator;
  readonly quantity: Locator;
  readonly decrease: Locator;
  readonly increase: Locator;
  readonly add: Locator;
  readonly remove: Locator;
  readonly cartQuantity: Locator;

  constructor(readonly root: Locator) {
    this.name = root.getByTestId('product-name');
    this.description = root.getByTestId('product-description');
    this.price = root.getByTestId('product-price');
    this.category = root.getByTestId('product-category');
    this.noImage = root.getByTestId('product-no-image');
    this.quantity = root.getByTestId('product-quantity-value');
    this.decrease = root.getByTestId('product-decrease-quantity');
    this.increase = root.getByTestId('product-increase-quantity');
    this.add = root.getByTestId('product-add-button');
    this.remove = root.getByTestId('product-remove-button');
    this.cartQuantity = root.getByTestId('product-card-cart-quantity');
  }
}
