import { test, expect } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { expectCart } from './cart-test-context';

test.describe('DELETE /api/v1/cart', () => {
  test('removes all items from the cart - 204', async ({ cart: context }) => {
    // given
    await context.addToCart(await context.createProduct(), 2);
    await context.addToCart(await context.createProduct(), 1);

    // when
    const response = await context.cartClient.clear();

    // then
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
    const cart = await context.cartClient.getCart();
    expectCart(await cart.json(), context.user.username, []);
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // when
    const response = await new CartClient(request).clear();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
