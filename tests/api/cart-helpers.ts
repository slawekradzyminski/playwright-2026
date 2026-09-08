import { expect } from '@playwright/test';
import { CartClient } from '../../http/cartClient';
import type { ProductDto } from '../../types/product';
import type { ExpectedCartItem } from '../../validators/cartResponse';

export function cartItem(product: ProductDto, quantity: number): ExpectedCartItem {
  return { productId: product.id, quantity, price: product.price };
}

export async function seedCart(client: CartClient, token: string, items: ExpectedCartItem[]) {
  for (const { productId, quantity } of items) {
    const response = await client.addItem({ productId, quantity }, token);
    expect(response.status(), 'Seed owned cart').toBe(200);
  }
}

export const cartUnauthorizedCases = [
  { label: 'anonymous request', token: undefined, message: 'Unauthorized' },
  { label: 'invalid token', token: 'invalid-token', message: 'Invalid or expired token' }
];
