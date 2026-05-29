import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class CartPage {
  readonly page: Page;
  readonly cartPageContainer: Locator;
  readonly cartPage: Locator;
  readonly title: Locator;
  readonly continueShoppingButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly browseProductsButton: Locator;
  readonly cartUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.cartPageContainer = page.getByTestId('cart-page-container');
    this.cartPage = page.getByTestId('cart-page');
    this.title = page.getByTestId('cart-title');
    this.continueShoppingButton = page.getByTestId('cart-continue-shopping');
    this.emptyCartMessage = page.getByTestId('cart-empty');
    this.browseProductsButton = page.getByTestId('cart-browse-products');
    this.cartUrl = `${APP_BASE_URL}/cart`;
  }

  async verifyEmptyCartLoaded() {
    await expect(this.page).toHaveURL(this.cartUrl);
    await expect(this.cartPageContainer).toBeVisible();
    await expect(this.cartPage).toBeVisible();
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.continueShoppingButton).toBeVisible();
    await expect(this.emptyCartMessage).toContainText('Your cart is empty');
    await expect(this.browseProductsButton).toBeVisible();
  }
}
