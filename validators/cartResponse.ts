import type { CartDto } from '../types/cart';
import { expectJson } from './jsonResponse';
import { expect, type APIResponse } from '@playwright/test';

export type ExpectedCartItem = { productId: number; quantity: number; price: number };

export async function expectCart(response: APIResponse, username: string, items: ExpectedCartItem[]) {
  const body = await expectJson<CartDto>(response, 200);
  expect(body.username).toBe(username);
  expect(body.items).toHaveLength(items.length);
  expect(body.items).toEqual(expect.arrayContaining(items.map(({ productId, quantity }) => ({ productId, quantity }))));
  expect(body.totalItems).toBe(items.reduce((sum, item) => sum + item.quantity, 0));
  const totalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  expect(body.totalPrice).toBe(totalCents / 100);
}
