import { test as base, expect } from './loggedInAdmin.fixture';
import { ProductClient } from '../http/productClient';

export const test = base.extend<{ productIds: Set<number> }>({
  productIds: async ({ request, adminToken }, use) => {
    const ids = new Set<number>();
    try {
      await use(ids);
    } finally {
      const client = new ProductClient(request);
      // Attempt every cleanup even if one deletion fails.
      const results = await Promise.allSettled([...ids].map(async id => {
        const response = await client.deleteProduct(id, adminToken);
        expect([204, 404], `Cleanup product ${id}`).toContain(response.status());
      }));
      const errors = results.filter(result => result.status === 'rejected');
      expect(errors, 'All test products must be cleaned up').toEqual([]);
    }
  }
});
export { expect } from '@playwright/test';
