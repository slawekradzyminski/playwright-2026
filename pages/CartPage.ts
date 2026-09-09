import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class CartPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('cart-page-container');
    this.title = this.root.getByTestId('cart-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/cart');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.title).toBeVisible();
  }
}
