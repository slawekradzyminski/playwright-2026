import { ProductsApi } from '../api/ProductsApi';
import { generateProduct } from '../generators/productGenerator';
import type { ProductCreateDto, ProductDto } from '../types/product';
import { test as loggedInAdminTest } from './loggedInAdmin.fixture';

type AdminProductsFixtures = {
  /** Creates a product as the logged in admin; every product is deleted after the test. */
  createProduct: (overrides?: Partial<ProductCreateDto>) => Promise<ProductDto>;
};

export const test = loggedInAdminTest.extend<AdminProductsFixtures>({
  createProduct: async ({ playwright, baseURL, admin }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    const productsApi = new ProductsApi(request, admin.token);
    const created: ProductDto[] = [];

    await use(async (overrides) => {
      const product = await productsApi.create(generateProduct(overrides));
      created.push(product);
      return product;
    });

    for (const { id } of created) {
      await productsApi.delete(id);
    }
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
