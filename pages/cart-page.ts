import { expect, type Page } from '@playwright/test';
import { GetCartClient } from '../clients/cart/get-cart-client';
import type { CartItemDto } from '../types/commerce';
import type { ProductDto } from '../types/product';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class CartPage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/cart', 'cart-page');
    this.header = new AuthenticatedHeader(page);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
  async reload() { await this.page.reload(); }
  async increaseQuantity(id: number) { await this.root.getByTestId(`cart-item-increase-${id}`).click(); }
  async updateQuantity(id: number) { await this.root.getByTestId(`cart-item-update-${id}`).click(); }
  async removeItem(id: number) { await this.root.getByTestId(`cart-item-remove-${id}`).click(); }
  async clear(confirm: boolean) {
    this.page.once('dialog', dialog => confirm ? dialog.accept() : dialog.dismiss());
    await this.root.getByTestId('cart-clear-button').click();
  }
  async checkout() { await this.root.getByTestId('cart-checkout-button').click(); }
  async expectItem(product: ProductDto, quantity: number) {
    await expect(this.root.getByTestId(`cart-item-name-${product.id}`)).toHaveText(product.name);
    await expect(this.root.getByTestId(`cart-item-quantity-${product.id}`)).toHaveText(String(quantity));
    await expect(this.root.getByTestId(`cart-item-total-${product.id}`)).toHaveText(`$${(product.price * quantity).toFixed(2)}`);
  }
  async expectSummary(quantity: number, total: number) {
    await expect(this.root.getByTestId('cart-summary-items-count')).toHaveText(String(quantity));
    await expect(this.root.getByTestId('cart-summary-total-price')).toHaveText(`$${total.toFixed(2)}`);
  }
  async expectEmpty() { await expect(this.root.getByTestId('cart-empty')).toBeVisible(); }

  async expectPersistedItems(token: string, items: CartItemDto[]) {
    const client = new GetCartClient(this.page.request);
    await expect.poll(async () => {
      const response = await client.get(token);
      expect(response.status()).toBe(200);
      const body = await response.json();
      return body.items.map(({ productId, quantity }: CartItemDto) => ({ productId, quantity }))
        .sort((a: CartItemDto, b: CartItemDto) => a.productId - b.productId);
    }).toEqual([...items].sort((a, b) => a.productId - b.productId));
  }

}
