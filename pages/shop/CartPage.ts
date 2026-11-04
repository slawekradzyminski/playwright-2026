import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { CartItemRow } from '../components/CartItemRow';
import { LoggedInHeader } from '../components/LoggedInHeader';

export class CartPage extends BasePage {
  protected readonly path = '/cart';
  readonly header: LoggedInHeader;
  readonly title: Locator;
  readonly continueShoppingLink: Locator;
  readonly emptyCart: Locator;
  readonly browseProductsLink: Locator;
  readonly summary: Locator;
  readonly summaryItemsCount: Locator;
  readonly summaryTotalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly clearButton: Locator;
  readonly itemRows: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedInHeader(page);
    this.title = page.getByTestId('cart-title');
    this.continueShoppingLink = page.getByTestId('cart-continue-shopping');
    this.emptyCart = page.getByTestId('cart-empty');
    this.browseProductsLink = page.getByTestId('cart-browse-products');
    this.summary = page.getByTestId('cart-summary');
    this.summaryItemsCount = page.getByTestId('cart-summary-items-count');
    this.summaryTotalPrice = page.getByTestId('cart-summary-total-price');
    this.checkoutButton = page.getByTestId('cart-checkout-button');
    this.clearButton = page.getByTestId('cart-clear-button');
    this.itemRows = page.getByTestId('cart-items-list').getByRole('row');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Your Cart');
  }

  item(productId: number): CartItemRow {
    return new CartItemRow(this.page, productId);
  }

  /** "Clear Cart" asks with a native confirm dialog before calling the API. */
  async clearCart({ confirm }: { confirm: boolean }) {
    this.page.once('dialog', (dialog) => (confirm ? dialog.accept() : dialog.dismiss()));
    await this.clearButton.click();
  }

  /** Summary box and the cart counter in the header. */
  async expectSummary(itemsCount: number, totalPrice: string) {
    await expect(this.summaryItemsCount).toHaveText(String(itemsCount));
    await expect(this.summaryTotalPrice).toHaveText(totalPrice);
    await expect(this.header.cartItemCount).toHaveText(String(itemsCount));
  }

  async expectEmpty() {
    await expect(this.emptyCart).toContainText('Your cart is empty');
    await expect(this.browseProductsLink).toHaveAttribute('href', '/products');
    await expect(this.itemRows).toHaveCount(0);
    await expect(this.summary).toBeHidden();
    await expect(this.checkoutButton).toBeHidden();
    await expect(this.header.cartItemCount).toBeHidden();
  }
}
