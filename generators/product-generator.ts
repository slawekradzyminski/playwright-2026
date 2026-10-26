import { faker } from '@faker-js/faker';
import type { ProductCreateDto } from '../types/product';

export function generateProduct(): ProductCreateDto {
  return {
    name: `${faker.commerce.productName()} ${faker.string.alphanumeric(8)}`,
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 1, max: 2000, dec: 2 })),
    stockQuantity: faker.number.int({ min: 10, max: 100 }),
    category: faker.commerce.department(),
    imageUrl: faker.image.url(),
  };
}
