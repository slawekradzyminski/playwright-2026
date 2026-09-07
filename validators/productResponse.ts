import { expect, type APIResponse } from '@playwright/test';
import type { ProductDto } from '../types/product';

export function expectValidProduct(product: unknown): asserts product is ProductDto {
  expect(product).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    description: expect.any(String),
    price: expect.any(Number),
    stockQuantity: expect.any(Number),
    category: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String)
  });

  expect(product).toHaveProperty('imageUrl');
  const imageUrl = (product as ProductDto).imageUrl;
  expect(imageUrl === null || typeof imageUrl === 'string').toBe(true);

  const typedProduct = product as ProductDto;
  expect(typedProduct.id).toBeGreaterThan(0);
  expect(typedProduct.name).not.toBe('');
  expect(typedProduct.price).toBeGreaterThan(0);
  expect(typedProduct.stockQuantity).toBeGreaterThanOrEqual(0);
  expect(Number.isNaN(Date.parse(typedProduct.createdAt))).toBe(false);
  expect(Number.isNaN(Date.parse(typedProduct.updatedAt))).toBe(false);
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

export function expectProductMatchesPayload(
  product: unknown,
  payload: Partial<ProductDto>
): asserts product is ProductDto {
  expectValidProduct(product);
  const suppliedFields = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
  expect(product).toMatchObject(suppliedFields);
}

export function expectUpdatedProduct(
  updated: unknown,
  original: ProductDto,
  payload: Partial<{ [K in keyof ProductDto]: ProductDto[K] | null }>
): asserts updated is ProductDto {
  expectValidProduct(updated);
  const changedFields = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  );
  expect(updated).toEqual({ ...original, ...changedFields, updatedAt: expect.any(String) });
  expect(Date.parse(updated.updatedAt)).toBeGreaterThanOrEqual(Date.parse(original.updatedAt));
}

export async function expectPersistedProduct(response: APIResponse, product: ProductDto): Promise<void> {
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual(product);
}
