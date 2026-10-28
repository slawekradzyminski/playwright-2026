import { randomUUID } from 'node:crypto';
import { test as base, expect } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { CartPage } from '../../../pages/cart.page';
import type { ProductDto } from '../../../types/product';

export const test = base.extend<{
  cartPage: CartPage;
  cartProduct: ProductDto;
  secondCartProduct: ProductDto;
  clientCart: CartClient;
}>({
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  cartProduct: async ({ api }, use) => {
    const suffix = randomUUID();
    const product = await api.createProduct({
      name: `Cart-${suffix}`,
      category: `Cart test ${suffix}`,
      description: 'Disposable product for cart UI coverage',
      price: 12.5,
      stockQuantity: 5,
      imageUrl: '',
    });
    await use(product);
  },
  secondCartProduct: async ({ api }, use) => {
    const suffix = randomUUID();
    const product = await api.createProduct({
      name: `Cart-${suffix}`,
      category: `Cart test ${suffix}`,
      description: 'Second disposable product for cart UI coverage',
      price: 3.25,
      stockQuantity: 4,
      imageUrl: '',
    });
    await use(product);
  },
  clientCart: async ({ request, context }, use) => {
    const state = await context.storageState();
    const token = state.origins.flatMap(origin => origin.localStorage).find(item => item.name === 'token')?.value;
    if (!token) throw new Error('The authenticated UI context must contain an access token');
    await use(new CartClient(request, token));
  },
});

export { expect };
