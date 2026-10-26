import { test, expect } from '@playwright/test';
import { generateProduct } from '../../../generators/product-generator';
import { CartClient } from '../../../http/cart-client';
import { CartTestContext, expectCart } from './cart-test-context';

const NON_EXISTENT_PRODUCT_ID = 999_999_999;

test.describe('POST /api/v1/cart/items', () => {
  let context: CartTestContext;

  test.beforeEach(async ({ request }) => {
    context = await CartTestContext.create(request);
  });

  test.afterEach(async () => {
    await context.cleanup();
  });

  test('adds a product to the cart - 200', async () => {
    // given
    const product = await context.createProduct();

    // when
    const response = await context.cartClient.addItem({ productId: product.id, quantity: 2 });

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, [{ product, quantity: 2 }]);
  });

  test('increases the quantity of a product already in the cart - 200', async () => {
    // given
    const product = await context.createProduct();
    await context.addToCart(product, 2);

    // when
    const response = await context.cartClient.addItem({ productId: product.id, quantity: 3 });

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, [{ product, quantity: 5 }]);
  });

  test('rejects a quantity below one - 400', async () => {
    // given
    const product = await context.createProduct();

    // when
    const response = await context.cartClient.addItem({ productId: product.id, quantity: 0 });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ quantity: 'must be greater than or equal to 1' });
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // given
    const product = await context.createProduct();

    // when
    const response = await new CartClient(request).addItem({ productId: product.id, quantity: 1 });

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects a non-existent product - 404', async () => {
    // when
    const response = await context.cartClient.addItem({ productId: NON_EXISTENT_PRODUCT_ID, quantity: 1 });

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Product not found' });
  });

  test('rejects a quantity exceeding the available stock - 409', async () => {
    // given
    const product = await context.createProduct({ ...generateProduct(), stockQuantity: 5 });
    await context.addToCart(product, 3);

    // when
    const response = await context.cartClient.addItem({ productId: product.id, quantity: 3 });

    // then
    expect(response.status()).toBe(409);
    expect(await response.json()).toEqual({ message: `Insufficient stock for product ${product.id}` });
    const cart = await context.cartClient.getCart();
    expectCart(await cart.json(), context.user.username, [{ product, quantity: 3 }]);
  });
});
