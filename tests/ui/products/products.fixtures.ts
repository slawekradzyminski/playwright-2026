import { randomUUID } from 'node:crypto';
import { test as base, expect } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { ProductsPage } from '../../../pages/products.page';
import type { ProductDto } from '../../../types/product';

interface Catalog {
  prefix: string;
  alpha: ProductDto;
  beta: ProductDto;
  gamma: ProductDto;
  delta: ProductDto;
}

export const test = base.extend<{
  catalog: Catalog;
  products: ProductsPage;
  clientCart: CartClient;
}>({
  catalog: async ({ api }, use) => {
    const prefix = `Catalog-${randomUUID()}`;
    const categoryA = `${prefix} A`;
    const categoryB = `${prefix} B`;
    const alpha = await api.createProduct({
      name: `${prefix} Alpha`, category: categoryA, description: 'Compact wireless headphones',
      price: 9.99, stockQuantity: 3, imageUrl: '',
    });
    const beta = await api.createProduct({
      name: `${prefix} Beta`, category: categoryA, description: 'Premium wireless headphones',
      price: 100, stockQuantity: 0, imageUrl: '',
    });
    const gamma = await api.createProduct({
      name: `${prefix} Gamma`, category: categoryB, description: 'Portable speaker',
      price: 20, stockQuantity: 1, imageUrl: '',
    });
    const delta = await api.createProduct({
      name: `${prefix} Delta`, category: categoryB, description: 'Desktop speaker',
      price: 3.5, stockQuantity: 5, imageUrl: '',
    });
    await use({ prefix, alpha, beta, gamma, delta });
    // The inherited API fixture removes owned users (and carts), then products.
  },
  products: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  clientCart: async ({ request, context }, use) => {
    const state = await context.storageState();
    const token = state.origins.flatMap(origin => origin.localStorage).find(item => item.name === 'token')?.value;
    if (!token) throw new Error('The authenticated UI context must contain an access token');
    await use(new CartClient(request, token));
  },
});

export { expect };
