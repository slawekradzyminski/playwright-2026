import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedInHeader } from './components/LoggedInHeader';

export class ProductDetailsPage extends BasePage {
  protected readonly path: string;
  readonly header: LoggedInHeader;
  readonly backLink: Locator;
  readonly title: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly category: Locator;
  /** "N in stock" or "Out of stock". */
  readonly stock: Locator;
  /** "N in cart", shown only when the product is already in the cart. */
  readonly cartQuantity: Locator;
  /** Quantity controls are hidden for an out of stock product. */
  readonly decreaseButton: Locator;
  readonly increaseButton: Locator;
  readonly quantity: Locator;
  /** "Add to Cart", or "Update Cart" when the product is already in the cart. */
  readonly addButton: Locator;
  readonly removeButton: Locator;
  /** Error box shown instead of the details when the product cannot be loaded. */
  readonly notFound: Locator;
  readonly notFoundBackLink: Locator;

  constructor(page: Page, productId: number) {
    super(page);
    this.path = `/products/${productId}`;
    this.header = new LoggedInHeader(page);
    this.backLink = page.getByTestId('product-back-link');
    this.title = page.getByTestId('product-title');
    this.price = page.getByTestId('product-price');
    this.description = page.getByTestId('product-description');
    this.category = page.getByTestId('product-category');
    this.stock = page.getByTestId('product-stock');
    this.cartQuantity = page.getByTestId('product-cart-quantity');
    this.decreaseButton = page.getByTestId('decrease-quantity');
    this.increaseButton = page.getByTestId('increase-quantity');
    this.quantity = page.getByTestId('quantity-value');
    this.addButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove-from-cart');
    this.notFound = page.getByTestId('product-not-found');
    this.notFoundBackLink = this.notFound.getByRole('link', { name: 'Back to Products' });
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toBeVisible();
  }

  /** Navigates without expecting the details to load (error states, redirects). */
  async open() {
    await this.page.goto(this.path);
  }

  async increaseQuantity(times: number) {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.click();
    }
  }
}
