import { randomUUID } from 'node:crypto';
import { test as base, expect } from './loggedInUi.fixture';
import { ProductClient } from '../../http/productClient';
import { LoginClient } from '../../http/loginClient';
import { CartClient } from '../../http/cartClient';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../test-config';
import type { ProductDto } from '../../types/product';

type Catalog = { key: string; categoryOne: string; categoryTwo: string; alpha: ProductDto; beta: ProductDto; gamma: ProductDto };

export const test = base.extend<{ catalog: Catalog }>({
  catalog: async ({ request, loggedInUser }, use) => {
    const key = `UI${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    const categoryOne = `${key} One`;
    const categoryTwo = `${key} Two`;
    const client = new ProductClient(request);
    const login = await new LoginClient(request).signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    expect(login.status()).toBe(200);
    const { token } = await login.json();
    const created: ProductDto[] = [];
    try {
      for (const product of [
        { name: `${key} Alpha`, description: `${key} Copper needle café &`, price: 9.99, stockQuantity: 2, category: categoryOne },
        { name: `${key} beta`, description: `${key} Silver NEEDLE`, price: 100, stockQuantity: 0, category: categoryOne },
        { name: `${key} Gamma`, description: `${key} Plain description`, price: 20, stockQuantity: 5, category: categoryTwo }
      ]) {
        const response = await client.createProduct(product, token);
        expect(response.status()).toBe(201);
        created.push(await response.json());
      }
      const [alpha, beta, gamma] = created;
      await use({ key, categoryOne, categoryTwo, alpha, beta, gamma });
    } finally {
      const cart = await new CartClient(request).clearCart(loggedInUser.token);
      const cleanup = await Promise.allSettled(created.map(async product => {
        const response = await client.deleteProduct(product.id, token);
        expect([204, 404], `Cleanup product ${product.id}`).toContain(response.status());
      }));
      expect(cart.ok(), 'Clear disposable customer cart').toBeTruthy();
      expect(cleanup.filter(result => result.status === 'rejected'), 'Delete every disposable product').toEqual([]);
    }
  }
});
export { expect } from '@playwright/test';
