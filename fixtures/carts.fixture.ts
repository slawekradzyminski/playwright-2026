import { test as base, expect } from './products.fixture';
import { registerAndLoginUser, deleteUserAsAdmin, type LoggedInUser } from './loggedInUser.fixture';
import { CartClient } from '../http/cartClient';
import { ProductClient } from '../http/productClient';
import { generateProduct } from '../generators/productGenerator';
import type { ProductDto } from '../types/product';

type CartSetup = {
  owner: LoggedInUser;
  other: LoggedInUser;
  products: [ProductDto, ProductDto];
};

export const test = base.extend<{ otherCartUser: LoggedInUser; cartSetup: CartSetup }>({
  otherCartUser: async ({ request }, use) => {
    const user = await registerAndLoginUser(request);
    try {
      await use(user);
    } finally {
      await deleteUserAsAdmin(request, user.user.username);
    }
  },
  // Depending on productIds ensures carts are cleared before product cleanup.
  cartSetup: async ({ request, loggedInUser, otherCartUser, adminToken, productIds }, use) => {
    const products = new ProductClient(request);
    const carts = new CartClient(request);
    const created: ProductDto[] = [];
    try {
      for (const price of [12.34, 5.67]) {
        const response = await products.createProduct(generateProduct({ price, stockQuantity: 20 }), adminToken);
        const product: ProductDto = await response.json();
        if (product.id) productIds.add(product.id);
        expect(response.status()).toBe(201);
        created.push(product);
      }
      await use({ owner: loggedInUser, other: otherCartUser, products: [created[0], created[1]] });
    } finally {
      const results = await Promise.allSettled([loggedInUser, otherCartUser].map(async user => {
        const response = await carts.clearCart(user.token);
        expect(response.status(), `Clear disposable cart ${user.user.username}`).toBe(204);
      }));
      expect(results.filter(result => result.status === 'rejected'), 'Both disposable carts must be cleared').toEqual([]);
    }
  }
});

export { expect } from '@playwright/test';
