import { Toast } from './components/toast';
import { GetCartClient } from '../clients/cart/get-cart-client';
import type { CartItemDto } from '../types/commerce';
import { expect, type Page } from '@playwright/test';
import { ProductCard } from './components/product-card';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class ProductsPage extends BasePage {
  readonly header: AuthenticatedHeader;
  readonly toast: Toast;
  private readonly cart: GetCartClient;

  constructor(page: Page) {
    super(page, '/products', 'products-page');
    this.header = new AuthenticatedHeader(page);
    this.toast = new Toast(page);
    this.cart = new GetCartClient(page.request);
  }

  product(name: string) {
    return new ProductCard(this.root.getByTestId('product-item').filter({
      has: this.page.getByTestId('product-name').filter({ hasText: name }),
    }));
  }

  async selectCategory(category: string) {
    await this.root.getByTestId('products-categories-list').getByRole('button', { name: category, exact: true }).click();
  }

  async search(query: string) {
    await this.root.getByTestId('product-search').fill(query);
  }

  async sortBy(label: 'Price (Low to High)' | 'Price (High to Low)') {
    await this.root.getByTestId('product-sort').selectOption({ label });
  }

  async clearSearch() {
    await this.root.getByRole('button', { name: 'Clear Search', exact: true }).click();
  }

  async reload() {
    await this.page.reload();
  }

  async expectProducts(names: string[]) {
    await expect(this.root.getByTestId('product-name')).toHaveText(names);
  }

  async expectNoResults() {
    await expect(this.root.getByText('No products found', { exact: true })).toBeVisible();
    await expect(this.root.getByTestId('product-item')).toHaveCount(0);
  }

  async expectCartItems(token: string, items: CartItemDto[]) {
    await expect.poll(async () => {
      const response = await this.cart.get(token);
      return { status: response.status(), items: (await response.json()).items.sort((a: CartItemDto, b: CartItemDto) => a.productId - b.productId) };
    }, { message: 'Persisted cart matches the catalog action' }).toEqual({ status: 200, items: [...items].sort((a, b) => a.productId - b.productId) });
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
}
