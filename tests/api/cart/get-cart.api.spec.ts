import { test, expect } from '@playwright/test';
import { CartClient } from '../../../http/cart-client';
import { CartTestContext, expectCart } from './cart-test-context';

test.describe('GET /api/v1/cart', () => {
  let context: CartTestContext;

  test.beforeEach(async ({ request }) => {
    context = await CartTestContext.create(request);
  });

  test.afterEach(async () => {
    await context.cleanup();
  });

  test('returns an empty cart for a new user - 200', async () => {
    // when
    const response = await context.cartClient.getCart();

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, []);
  });

  test('returns cart items with calculated totals - 200', async () => {
    // given
    const firstProduct = await context.createProduct();
    const secondProduct = await context.createProduct();
    await context.addToCart(firstProduct, 2);
    await context.addToCart(secondProduct, 3);

    // when
    const response = await context.cartClient.getCart();

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, [
      { product: firstProduct, quantity: 2 },
      { product: secondProduct, quantity: 3 },
    ]);
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // when
    const response = await new CartClient(request).getCart();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
