import { test, expect } from '@playwright/test';
import { generateProduct } from '../../../generators/product-generator';
import { CartClient } from '../../../http/cart-client';
import { CartTestContext, expectCart } from './cart-test-context';

test.describe('PUT /api/v1/cart/items/{productId}', () => {
  let context: CartTestContext;

  test.beforeEach(async ({ request }) => {
    context = await CartTestContext.create(request);
  });

  test.afterEach(async () => {
    await context.cleanup();
  });

  test('sets the quantity of a product in the cart - 200', async () => {
    // given
    const product = await context.createProduct();
    await context.addToCart(product, 2);

    // when
    const response = await context.cartClient.updateItem(product.id, { quantity: 5 });

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, [{ product, quantity: 5 }]);
  });

  test('removes the product when the quantity is zero - 200', async () => {
    // given
    const removedProduct = await context.createProduct();
    const keptProduct = await context.createProduct();
    await context.addToCart(removedProduct, 2);
    await context.addToCart(keptProduct, 1);

    // when
    const response = await context.cartClient.updateItem(removedProduct.id, { quantity: 0 });

    // then
    expect(response.status()).toBe(200);
    expectCart(await response.json(), context.user.username, [{ product: keptProduct, quantity: 1 }]);
  });

  test('rejects a negative quantity - 400', async () => {
    // given
    const product = await context.createProduct();
    await context.addToCart(product, 2);

    // when
    const response = await context.cartClient.updateItem(product.id, { quantity: -1 });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ quantity: 'Quantity cannot be negative' });
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // given
    const product = await context.createProduct();

    // when
    const response = await new CartClient(request).updateItem(product.id, { quantity: 1 });

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects a product that is not in the cart - 404', async () => {
    // given
    const product = await context.createProduct();

    // when
    const response = await context.cartClient.updateItem(product.id, { quantity: 1 });

    // then
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Cart item not found' });
  });

  test('rejects a quantity exceeding the available stock - 409', async () => {
    // given
    const product = await context.createProduct({ ...generateProduct(), stockQuantity: 5 });
    await context.addToCart(product, 2);

    // when
    const response = await context.cartClient.updateItem(product.id, { quantity: 6 });

    // then
    expect(response.status()).toBe(409);
    expect(await response.json()).toEqual({ message: `Insufficient stock for product ${product.id}` });
    const cart = await context.cartClient.getCart();
    expectCart(await cart.json(), context.user.username, [{ product, quantity: 2 }]);
  });
});
