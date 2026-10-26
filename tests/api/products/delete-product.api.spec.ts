import { test, expect } from '../fixtures';
import { ProductsClient } from '../../../http/products-client';
import { expectCart } from '../cart/cart-test-context';

test.describe('DELETE /api/v1/products/{id}', () => {
  test('deletes a product - 204', async ({ api }) => {
    // given
    const product = await api.createProduct();
    const products = await api.adminProducts();

    // when
    const response = await products.delete(product.id);
    if (response.status() === 204) api.forgetProduct(product.id);

    // then
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
    const stored = await products.getById(product.id);
    expect(stored.status()).toBe(404);
    expect(await stored.json()).toEqual({ message: 'Product not found' });
  });

  test('rejects a malformed ID - 400', async ({ api }) => {
    // given
    const products = await api.adminProducts();

    // when
    const response = await products.delete('abc');

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });

  test('rejects a request without a token - 401', async ({ api, request }) => {
    // given
    const product = await api.createProduct();

    // when
    const response = await new ProductsClient(request).delete(product.id);
    if (response.status() === 204) api.forgetProduct(product.id);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
    const stored = await (await api.adminProducts()).getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(product);
  });

  test('rejects a client deleting an existing product - 403', async ({ api, request }) => {
    // given
    const product = await api.createProduct();
    const { token } = await api.createUser();

    // when
    const response = await new ProductsClient(request, token).delete(product.id);
    if (response.status() === 204) api.forgetProduct(product.id);

    // then
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ message: 'Access denied' });
    const stored = await (await api.adminProducts()).getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(product);
  });

  test('returns an empty not found response for a deleted product - 404', async ({ api }) => {
    // given
    const product = await api.createProduct();
    await api.deleteProduct(product.id);
    const products = await api.adminProducts();

    // when
    const response = await products.delete(product.id);

    // then
    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('');
  });

  test('preserves a product referenced by a cart - 409', async ({ api, cart }) => {
    // given
    const product = await cart.createProduct();
    await cart.addToCart(product, 2);
    const products = await api.adminProducts();

    // when
    const response = await products.delete(product.id);
    if (response.status() === 204) api.forgetProduct(product.id);

    // then
    expect(response.status()).toBe(409);
    expect(await response.json()).toEqual({ message: 'Product is referenced by existing data' });
    const stored = await products.getById(product.id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(product);
    const storedCart = await cart.cartClient.getCart();
    expect(storedCart.status()).toBe(200);
    expectCart(await storedCart.json(), cart.user.username, [{ product, quantity: 2 }]);
  });
});
