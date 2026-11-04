import { ProductsApi } from '../api/ProductsApi';
import { test as productsTest } from './products.fixture';

type TestFixtures = {
  /** Admin products API for changing or deleting a product after the page was loaded; does not clean up. */
  productsApi: ProductsApi;
};

export const test = productsTest.extend<TestFixtures>({
  productsApi: async ({ playwright, baseURL, adminToken }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(new ProductsApi(request, adminToken));
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
