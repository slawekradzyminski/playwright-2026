import { expect } from '../fixtures';
import type { ProductCreateDto, ProductDto } from '../../../types/product';

export function expectProduct(body: ProductDto, expected: ProductCreateDto): void {
  const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  expect(body).toEqual({
    ...expected,
    imageUrl: expected.imageUrl ?? null,
    id: expect.any(Number),
    createdAt: expect.stringMatching(localDateTime),
    updatedAt: expect.stringMatching(localDateTime),
  });
  expect(body.id).toBeGreaterThan(0);
}
