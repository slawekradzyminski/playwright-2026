import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  protected readonly path = '/cart';
  readonly title: Locator;
  readonly emptyState: Locator;
  readonly summaryItems: Locator;
  readonly summaryTotal: Locator;
  readonly checkoutButton: Locator;
  readonly clearButton: Locator;
  readonly browseProductsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('cart-title');
    this.emptyState = page.getByTestId('cart-empty');
    this.summaryItems = page.getByTestId('cart-summary-items-count');
    this.summaryTotal = page.getByTestId('cart-summary-total-price');
    this.checkoutButton = page.getByTestId('cart-checkout-button');
    this.clearButton = page.getByTestId('cart-clear-button');
    this.browseProductsLink = page.getByTestId('cart-browse-products');
  }

  async goto() { await this.page.goto(this.path); }
  async reload() { await this.page.reload(); }
  async browseProducts() { await this.browseProductsLink.click(); }
  item(productId: number) { return this.page.getByTestId(`cart-item-${productId}`); }
  itemName(productId: number) { return this.page.getByTestId(`cart-item-name-${productId}`); }
  itemQuantity(productId: number) { return this.page.getByTestId(`cart-item-quantity-${productId}`); }
  itemTotal(productId: number) { return this.page.getByTestId(`cart-item-total-${productId}`); }
  decreaseItem(productId: number) { return this.page.getByTestId(`cart-item-decrease-${productId}`).click(); }
  increaseItem(productId: number) { return this.page.getByTestId(`cart-item-increase-${productId}`).click(); }
  updateItem(productId: number) { return this.page.getByTestId(`cart-item-update-${productId}`).click(); }
  removeItem(productId: number) { return this.page.getByTestId(`cart-item-remove-${productId}`).click(); }
  async clearWithConfirmation(accept: boolean) {
    this.page.once('dialog', dialog => accept ? dialog.accept() : dialog.dismiss());
    await this.clearButton.click();
  }
}
