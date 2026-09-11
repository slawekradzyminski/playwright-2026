import { expect } from '@playwright/test';
import { test } from '../../../fixtures/api/commerce';
import { unauthorizedCases } from '../test-data/unauthorized-cases';
import { GetCartClient } from '../../../clients/cart/get-cart-client';
import { AddCartItemClient } from '../../../clients/cart/add-cart-item-client';

test.describe('GET /api/v1/cart', () => {
  let cart: GetCartClient;
  let add: AddCartItemClient;

  test.beforeEach(async ({ request }) => {
    // given
    cart = new GetCartClient(request);
    add = new AddCartItemClient(request);
  });

  test('should return an empty cart for a new client - 200', async ({ commerce }) => {
    // given
    const token = commerce.user.token;

    // when
    const response = await cart.get(token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ username: commerce.user.username, items: [], totalPrice: 0, totalItems: 0 });
  });

  test('should calculate totals and isolate carts by owner - 200', async ({ commerce }) => {
    // given
    expect((await add.add({ productId: commerce.product.id, quantity: 2 }, commerce.user.token)).status()).toBe(200);

    // when
    const response = await cart.get(commerce.user.token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ username: commerce.user.username, items: [{ productId: commerce.product.id, quantity: 2 }], totalPrice: 24.68, totalItems: 2 });
    const other = await cart.get(commerce.other.token);
    expect(other.status()).toBe(200);
    expect(await other.json()).toEqual({ username: commerce.other.username, items: [], totalPrice: 0, totalItems: 0 });
  });

  test('should reject missing, invalid and tampered credentials - 401', async ({ commerce }) => {
    // given
    const token = commerce.user.token;
    for (const { name, token: rejectedToken, message } of unauthorizedCases(token)) {
      await test.step(name, async () => {
        // when
        const response = await cart.get(rejectedToken);

        // then
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ message });
      });
    }
  });
});
