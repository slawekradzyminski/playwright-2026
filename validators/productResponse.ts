import { expect } from '@playwright/test';
import type { ProductDto } from '../types/product';

export function expectValidProduct(product: unknown): asserts product is ProductDto {
  expect(product).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    description: expect.any(String),
    price: expect.any(Number),
    stockQuantity: expect.any(Number),
    category: expect.any(String),
    imageUrl: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String)
  });

  const typedProduct = product as ProductDto;
  expect(typedProduct.id).toBeGreaterThan(0);
  expect(typedProduct.name).not.toBe('');
  expect(typedProduct.price).toBeGreaterThan(0);
  expect(typedProduct.stockQuantity).toBeGreaterThanOrEqual(0);
}

export function expectValidProductCollection(products: unknown): asserts products is ProductDto[] {
  expect(products).toEqual(expect.any(Array));

  if (!Array.isArray(products)) {
    throw new Error('Products response must be an array');
  }

  expect(products).not.toHaveLength(0);

  for (const product of products) {
    expectValidProduct(product);
  }
}
