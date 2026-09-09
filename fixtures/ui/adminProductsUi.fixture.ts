import { randomUUID } from 'node:crypto';
import { test as base, expect } from './loggedInAdminUi.fixture';
import { ProductClient } from '../../http/productClient';
import { expectJson } from '../../validators/jsonResponse';
import type { ProductDto } from '../../types/product';

type AdminProductFixture = {
  adminProduct: ProductDto;
  adminProductIds: Set<number>;
};

export const test = base.extend<AdminProductFixture>({
  adminProductIds: async ({ request, loggedInAdmin }, use) => {
    const ids = new Set<number>();
    try { await use(ids); }
    finally {
      const client = new ProductClient(request);
      const results = await Promise.allSettled([...ids].map(async id => {
        const response = await client.deleteProduct(id, loggedInAdmin.token);
        expect([204, 404], `Cleanup product ${id}`).toContain(response.status());
      }));
      expect(results.filter(result => result.status === 'rejected')).toEqual([]);
    }
  },
  adminProduct: async ({ request, loggedInAdmin, adminProductIds }, use) => {
    const client = new ProductClient(request);
    const payload = {
      name: `UI Admin Product ${randomUUID()}`,
      description: 'Disposable admin product description',
      price: 37.25,
      stockQuantity: 7,
      category: 'UI Admin Tests'
    };
    const response = await client.createProduct(payload, loggedInAdmin.token);
    const product = await expectJson<ProductDto>(response, 201);
    adminProductIds.add(product.id);
    await use(product);
  }
});

export { expect } from '@playwright/test';
