import { faker } from '@faker-js/faker';
import type { ProductCreateDto } from '../types/product';

export function generateProduct(overrides: Partial<ProductCreateDto> = {}): ProductCreateDto {
  return {
    name: `${faker.commerce.productName()} ${faker.string.numeric(10)}`,
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 1, max: 1000, dec: 2 })),
    stockQuantity: faker.number.int({ min: 0, max: 100 }),
    category: faker.commerce.department(),
    imageUrl: faker.image.url(),
    ...overrides
  };
}
