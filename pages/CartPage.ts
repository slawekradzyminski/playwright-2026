import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartPageContainer: Locator;
  readonly cartPage: Locator;
  readonly title: Locator;
  readonly continueShoppingButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly browseProductsButton: Locator;

  constructor(page: Page) {
    super(page, '/cart');
    this.cartPageContainer = this.byTestId('cart-page-container');
    this.cartPage = this.byTestId('cart-page');
    this.title = this.byTestId('cart-title');
    this.continueShoppingButton = this.byTestId('cart-continue-shopping');
    this.emptyCartMessage = this.byTestId('cart-empty');
    this.browseProductsButton = this.byTestId('cart-browse-products');
  }

  async verifyEmptyCartLoaded() {
    await this.verifyUrl();
    await expect(this.cartPageContainer).toBeVisible();
    await expect(this.cartPage).toBeVisible();
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.continueShoppingButton).toBeVisible();
    await expect(this.emptyCartMessage).toContainText('Your cart is empty');
    await expect(this.browseProductsButton).toBeVisible();
  }
}
