import { test, expect } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { expectCart } from './cart-test-context';

test.describe('DELETE /api/v1/cart/items/{productId}', () => {
  test('removes only the given product from the cart - 200', async ({ cart: context }) => {
    // given
    const removedProduct = await context.createProduct();
    const keptProduct = await context.createProduct();
    await context.addToCart(removedProduct, 2);
    await context.addToCart(keptProduct, 1);

    // when
    const response = await context.cartClient.removeItem(removedProduct.id);

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, [{ product: keptProduct, quantity: 1 }]);
  });

  test('rejects a request without a token - 401', async ({ request, cart: context }) => {
    // given
    const product = await context.createProduct();

    // when
    const response = await new CartClient(request).removeItem(product.id);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects a product that is not in the cart - 404', async ({ cart: context }) => {
    // given
    const product = await context.createProduct();

    // when
    const response = await context.cartClient.removeItem(product.id);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Cart item not found' });
  });
});
