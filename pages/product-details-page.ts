import { expect, type Page } from '@playwright/test';
import { GetProductByIdClient } from '../clients/products/get-product-by-id-client';
import { APP_BASE_URL } from '../test-config';
import { AuthenticatedHeader } from './components/authenticated-header';
import { Toast } from './components/toast';
import type { ProductDto } from '../types/product';

export class ProductDetailsPage {
  readonly header: AuthenticatedHeader;
  readonly toast: Toast;
  constructor(private readonly page: Page) {
    this.header = new AuthenticatedHeader(page);
    this.toast = new Toast(page);
  }

  async open(id: number) { await this.page.goto(`${APP_BASE_URL}/products/${id}`); }
  async reload() { await this.page.reload(); }
  async increaseQuantity() { await this.page.getByTestId('increase-quantity').click(); }
  async saveToCart() { await this.page.getByTestId('add-to-cart').click(); }
  async removeFromCart() { await this.page.getByTestId('remove-from-cart').click(); }
  async expectInCart(quantity: number) {
    await expect(this.page.getByTestId('product-cart-quantity')).toHaveText(`${quantity} in cart`);
    await expect(this.page.getByTestId('quantity-value')).toHaveText(String(quantity));
    await expect(this.page.getByTestId('add-to-cart')).toHaveText('Update Cart');
  }
  async expectNotInCart() {
    await expect(this.page.getByTestId('product-cart-quantity')).toHaveCount(0);
    await expect(this.page.getByTestId('add-to-cart')).toHaveText('Add to Cart');
  }
  async expectOutOfStock() {
    await expect(this.page.getByTestId('product-stock')).toHaveText('Out of stock');
    await expect(this.page.getByTestId('add-to-cart')).toBeDisabled();
  }
  async expectUnavailable() { await expect(this.page.getByTestId('product-not-found')).toHaveText(/Error loading product details/); }
  async backToProducts() { await this.page.getByTestId('product-not-found').getByRole('link', { name: 'Back to Products' }).click(); }


  async expectUrl(id: number) {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}/products/${id}`);
  }

  async expectProduct(product: ProductDto) {
    const root = this.page.getByTestId('product-details-page');
    await expect(root.getByTestId('product-title')).toHaveText(product.name);
    await expect(root.getByTestId('product-price')).toHaveText(`$${product.price.toFixed(2)}`);
    await expect(root.getByTestId('product-description')).toHaveText(product.description);
  }
  async expectPersistedStock(id: number, token: string, quantity: number) {
    const response = await new GetProductByIdClient(this.page.request).get(id, token);
    expect(response.status()).toBe(200);
    expect((await response.json()).stockQuantity).toBe(quantity);
  }

}
