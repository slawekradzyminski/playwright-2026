import { test, expect } from '@playwright/test';
import { CartClient } from '../../../http/cart-client';
import { CartTestContext, expectCart } from './cart-test-context';

test.describe('DELETE /api/v1/cart/items/{productId}', () => {
  let context: CartTestContext;

  test.beforeEach(async ({ request }) => {
    context = await CartTestContext.create(request);
  });

  test.afterEach(async () => {
    await context.cleanup();
  });

  test('removes only the given product from the cart - 200', async () => {
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

  test('rejects a request without a token - 401', async ({ request }) => {
    // given
    const product = await context.createProduct();

    // when
    const response = await new CartClient(request).removeItem(product.id);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects a product that is not in the cart - 404', async () => {
    // given
    const product = await context.createProduct();

    // when
    const response = await context.cartClient.removeItem(product.id);

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Cart item not found' });
  });
});
