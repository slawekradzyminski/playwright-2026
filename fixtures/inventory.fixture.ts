import { randomUUID } from 'node:crypto';
import { test as base, expect } from './products.fixture';
import { ProductClient } from '../http/productClient';
import { expectJson } from '../validators/jsonResponse';
import { expectValidProduct } from '../validators/productResponse';
import { generateProduct } from '../generators/productGenerator';

type InventoryFixtures = {
  inventoryProduct: { id: number; stockQuantity: number; name: string; category: string };
};

export const test = base.extend<InventoryFixtures>({
  inventoryProduct: async ({ request, adminToken, productIds }, use) => {
    const client = new ProductClient(request);
    const payload = generateProduct({
      name: `Inventory API ${randomUUID()}`,
      category: 'Inventory API Tests',
      stockQuantity: 2
    });
    const response = await client.createProduct(payload, adminToken);
    const product = await response.json();
    if (Number.isInteger(product.id)) productIds.add(product.id);
    await expectJson(response, 201);
    expectValidProduct(product);
    await use({ id: product.id, stockQuantity: product.stockQuantity, name: product.name, category: product.category });
  }
});

export { expect } from '@playwright/test';
