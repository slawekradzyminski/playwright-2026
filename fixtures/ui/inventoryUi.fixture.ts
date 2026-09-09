import { randomUUID } from 'node:crypto';
import { test as base } from './loggedInAdminUi.fixture';
import type { ProductDto } from '../../types/product';

type InventoryCatalog = {
  key: string;
  category: string;
  otherCategory: string;
  empty: ProductDto;
  low: ProductDto;
  available: ProductDto;
};

export const test = base.extend<{ inventoryCatalog: InventoryCatalog }>({
  inventoryCatalog: async ({ productFactory }, use) => {
    const key = `UIInventory${randomUUID().replaceAll('-', '').slice(0, 10)}`;
    const category = `${key} A`;
    const otherCategory = `${key} B`;
    const created: ProductDto[] = [];
    for (const [index, stockQuantity] of [0, 2, 8].entries()) {
      const product = await productFactory.create({
        name: `${key} ${['Empty', 'Low', 'Available'][index]}`,
        description: 'Disposable inventory UI fixture',
        price: 12.34,
        stockQuantity,
        category: index === 2 ? otherCategory : category,
        imageUrl: undefined
      });
      created.push(product);
    }
    const [empty, low, available] = created;
    await use({ key, category, otherCategory, empty, low, available });
  }
});

export { expect } from '@playwright/test';
