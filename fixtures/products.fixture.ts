import { CartApi } from '../api/CartApi';
import { ProductsApi } from '../api/ProductsApi';
import { generateProduct } from '../generators/productGenerator';
import type { ProductCreateDto, ProductDto } from '../types/product';
import { test as loggedInTest } from './loggedIn.fixture';

type TestFixtures = {
  /** Cart of the logged in `user`. */
  cartApi: CartApi;
  /** Creates a product through the admin API; every product is deleted after the test. */
  createProduct: (overrides?: Partial<ProductCreateDto>) => Promise<ProductDto>;
};

export const test = loggedInTest.extend<TestFixtures>({
  cartApi: async ({ playwright, baseURL, user }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(new CartApi(request, user.token));
    await request.dispose();
  },

  createProduct: async ({ playwright, baseURL, adminToken, cartApi }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    const productsApi = new ProductsApi(request, adminToken);
    const created: ProductDto[] = [];

    await use(async (overrides) => {
      const product = await productsApi.create(generateProduct(overrides));
      created.push(product);
      return product;
    });

    // A product still in the cart cannot be deleted (409).
    await cartApi.clear();
    for (const { id } of created) {
      await productsApi.delete(id);
    }
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
