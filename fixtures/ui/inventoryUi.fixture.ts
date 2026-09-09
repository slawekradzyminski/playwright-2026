import { randomUUID } from 'node:crypto';
import { test as base, expect } from './loggedInAdminUi.fixture';
import { ProductClient } from '../../http/productClient';
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
  inventoryCatalog: async ({ request, loggedInAdmin }, use) => {
    const key = `UIInventory${randomUUID().replaceAll('-', '').slice(0, 10)}`;
    const category = `${key} A`;
    const otherCategory = `${key} B`;
    const products = new ProductClient(request);
    const created: ProductDto[] = [];
    try {
      for (const [index, stockQuantity] of [0, 2, 8].entries()) {
        const response = await products.createProduct({
          name: `${key} ${['Empty', 'Low', 'Available'][index]}`,
          description: 'Disposable inventory UI fixture',
          price: 12.34,
          stockQuantity,
          category: index === 2 ? otherCategory : category
        }, loggedInAdmin.token);
        const product = await response.json() as ProductDto;
        if (product.id) created.push(product);
        expect(response.status(), 'Create isolated inventory product').toBe(201);
      }
      const [empty, low, available] = created;
      await use({ key, category, otherCategory, empty, low, available });
    } finally {
      const results = await Promise.allSettled(created.map(async product => {
        const response = await products.deleteProduct(product.id, loggedInAdmin.token);
        expect([204, 404], `Remove owned inventory product ${product.id}`).toContain(response.status());
      }));
      expect(results.filter(result => result.status === 'rejected'), 'All inventory products removed').toEqual([]);
    }
  }
});
export { expect } from '@playwright/test';
