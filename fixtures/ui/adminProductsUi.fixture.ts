import { randomUUID } from 'node:crypto';
import { test as base } from './loggedInAdminUi.fixture';
import type { ProductDto } from '../../types/product';

export const test = base.extend<{ adminProduct: ProductDto }>({
  adminProduct: async ({ productFactory }, use) => {
    await use(await productFactory.create({
      name: `UI Admin Product ${randomUUID()}`,
      description: 'Disposable admin product description',
      price: 37.25,
      stockQuantity: 7,
      category: 'UI Admin Tests',
      imageUrl: undefined
    }));
  }
});

export { expect } from '@playwright/test';
