import { randomUUID } from 'node:crypto';
import { test as base } from './products.fixture';

type InventoryFixtures = {
  inventoryProduct: { id: number; stockQuantity: number; name: string; category: string };
};

export const test = base.extend<InventoryFixtures>({
  inventoryProduct: async ({ productFactory }, use) => {
    const product = await productFactory.create({
      name: `Inventory API ${randomUUID()}`,
      category: 'Inventory API Tests',
      stockQuantity: 2
    });
    await use({ id: product.id, stockQuantity: product.stockQuantity, name: product.name, category: product.category });
  }
});

export { expect } from '@playwright/test';
