import { faker } from '@faker-js/faker';
import type { ProductCreateDto } from '../types/product';

/**
 * A single lowercase word, unique per call. Tests put their own products in their own category,
 * so they never depend on the shared catalog or on each other.
 */
export function generateCategory(): string {
  return `cat${faker.string.alphanumeric({ length: 10, casing: 'lower' })}`;
}

export function generateProduct(overrides: Partial<ProductCreateDto> = {}): ProductCreateDto {
  return {
    name: `${faker.commerce.productName()} ${faker.string.alphanumeric({ length: 8, casing: 'lower' })}`,
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 1, max: 999 })),
    stockQuantity: faker.number.int({ min: 10, max: 100 }),
    category: generateCategory(),
    ...overrides,
  };
}
