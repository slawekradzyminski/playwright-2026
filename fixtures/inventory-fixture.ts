import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { test as base } from './product-fixture';
import { CreateProductClient } from '../clients/products/create-product-client';
import { ProductGenerator } from '../generators/product-generator';
import type { ProductDto } from '../types/product';

export const test = base.extend<{ inventoryProduct: ProductDto }>({
  inventoryProduct: async ({ request, adminToken, trackProduct }, use) => {
    const response = await new CreateProductClient(request).create(ProductGenerator.generate({
      name: `Inventory Fixture ${randomUUID()}`,
      description: 'Deterministic inventory fixture',
      stockQuantity: 5,
      price: 12.34,
      category: 'Inventory Fixtures',
    }), adminToken);
    expect(response.status(), 'Create inventory fixture product').toBe(201);
    const product: ProductDto = await response.json();
    trackProduct(product.id);
    await use(product);
  },
});
