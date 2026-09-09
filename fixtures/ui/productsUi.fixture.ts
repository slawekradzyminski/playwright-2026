import { randomUUID } from 'node:crypto';
import { test as base } from './loggedInUi.fixture';
import type { ProductDto } from '../../types/product';

type Catalog = { key: string; categoryOne: string; categoryTwo: string; alpha: ProductDto; beta: ProductDto; gamma: ProductDto };

export const test = base.extend<{ catalog: Catalog }>({
  catalog: async ({ productFactory }, use) => {
    const key = `UI${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    const categoryOne = `${key} One`;
    const categoryTwo = `${key} Two`;
    const alpha = await productFactory.create({ name: `${key} Alpha`, description: `${key} Copper needle café &`, price: 9.99, stockQuantity: 2, category: categoryOne, imageUrl: undefined });
    const beta = await productFactory.create({ name: `${key} beta`, description: `${key} Silver NEEDLE`, price: 100, stockQuantity: 0, category: categoryOne, imageUrl: undefined });
    const gamma = await productFactory.create({ name: `${key} Gamma`, description: `${key} Plain description`, price: 20, stockQuantity: 5, category: categoryTwo, imageUrl: undefined });
    await use({ key, categoryOne, categoryTwo, alpha, beta, gamma });
  }
});

export { expect } from '@playwright/test';
