import { test, expect } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { expectCart as expectRestCart } from '../cart/cart-test-context';
import type { GqlCart } from '../../../types/graphql';
import { expectData, expectFieldError } from './graphql-assertions';
import { expectCart } from './graphql-test-context';
import { ADD_CART_ITEM, CLEAR_CART, REMOVE_CART_ITEM, UPDATE_CART_ITEM } from './mutations';

test.describe('GraphQL cart mutations', () => {
  test.describe('Mutation.addCartItem', () => {
    test('adds units to an existing line and REST reads the same cart', async ({ request, graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 10 });
      await graphql.addToCart(product, 2);

      // when
      const response = await graphql.client.execute(ADD_CART_ITEM, { productId: String(product.id), quantity: 3 });

      // then
      const { addCartItem } = await expectData<{ addCartItem: GqlCart }>(response);
      expectCart(addCartItem, graphql.customer.user.username, [{ product, quantity: 5 }]);
      const restCart = await new CartClient(request, graphql.customer.token).getCart();
      expect(restCart.status()).toBe(200);
      expectRestCart(await restCart.json(), graphql.customer.user.username, [{ product, quantity: 5 }]);
    });

    test('does not reserve stock for products waiting in carts', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 2 });
      const other = await graphql.createCustomer();
      await graphql.addToCart(product, 2, other.client);

      // when
      const response = await graphql.client.execute(ADD_CART_ITEM, { productId: String(product.id), quantity: 2 });

      // then
      await expectData(response);
      await graphql.expectSavedCart([{ product, quantity: 2 }]);
      await graphql.expectSavedCart([{ product, quantity: 2 }], other);
      await graphql.expectStock(product, 2);
    });

    test('lets an administrator add to a named customer cart', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphqlAdmin.execute(ADD_CART_ITEM, {
        productId: String(product.id), quantity: 1, username: graphql.customer.user.username,
      });

      // then
      await expectData(response);
      await graphql.expectSavedCart([{ product, quantity: 1 }]);
    });

    test('rejects a zero quantity without changing the cart - BAD_REQUEST', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      await graphql.addToCart(product, 1);

      // when
      const response = await graphql.client.execute(ADD_CART_ITEM, { productId: String(product.id), quantity: 0 });

      // then
      await expectFieldError(response, { field: 'addCartItem', code: 'BAD_REQUEST' });
      await graphql.expectSavedCart([{ product, quantity: 1 }]);
    });

    test('forbids adding to another customer cart - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const other = await graphql.createCustomer();

      // when
      const response = await graphql.client.execute(ADD_CART_ITEM, {
        productId: String(product.id), quantity: 1, username: other.user.username,
      });

      // then
      await expectFieldError(response, { field: 'addCartItem', code: 'FORBIDDEN' });
      await graphql.expectSavedCart([], other);
      await graphql.expectSavedCart([]);
    });

    test('rejects more units than the remaining stock - CONFLICT', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 5 });
      await graphql.addToCart(product, 3);

      // when
      const response = await graphql.client.execute(ADD_CART_ITEM, { productId: String(product.id), quantity: 3 });

      // then
      await expectFieldError(response, {
        field: 'addCartItem', code: 'CONFLICT', message: `Insufficient stock for product ${product.id}`,
      });
      await graphql.expectSavedCart([{ product, quantity: 3 }]);
    });
  });

  test.describe('Mutation.updateCartItem', () => {
    test('sets an absolute quantity for a line', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ stockQuantity: 10 });
      await graphql.addToCart(product, 4);

      // when
      const response = await graphql.client.execute(UPDATE_CART_ITEM, { productId: String(product.id), quantity: 2 });

      // then
      const { updateCartItem } = await expectData<{ updateCartItem: GqlCart }>(response);
      expectCart(updateCartItem, graphql.customer.user.username, [{ product, quantity: 2 }]);
      await graphql.expectSavedCart([{ product, quantity: 2 }]);
    });

    test('removes the line when the quantity is set to zero', async ({ graphql }) => {
      // given
      const kept = await graphql.createProduct();
      const dropped = await graphql.createProduct();
      await graphql.addToCart(kept, 1);
      await graphql.addToCart(dropped, 2);

      // when
      const response = await graphql.client.execute(UPDATE_CART_ITEM, { productId: String(dropped.id), quantity: 0 });

      // then
      await expectData(response);
      await graphql.expectSavedCart([{ product: kept, quantity: 1 }]);
    });

    test('forbids changing another customer cart - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const other = await graphql.createCustomer();
      await graphql.addToCart(product, 2, other.client);

      // when
      const response = await graphql.client.execute(UPDATE_CART_ITEM, {
        productId: String(product.id), quantity: 1, username: other.user.username,
      });

      // then
      await expectFieldError(response, { field: 'updateCartItem', code: 'FORBIDDEN' });
      await graphql.expectSavedCart([{ product, quantity: 2 }], other);
    });

    test('reports a product that is not in the cart - NOT_FOUND', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphql.client.execute(UPDATE_CART_ITEM, { productId: String(product.id), quantity: 1 });

      // then
      await expectFieldError(response, { field: 'updateCartItem', code: 'NOT_FOUND', message: 'Cart item not found' });
      await graphql.expectSavedCart([]);
    });
  });

  test.describe('Mutation.removeCartItem', () => {
    test('removes one line and keeps the rest of the cart', async ({ graphql }) => {
      // given
      const kept = await graphql.createProduct();
      const removed = await graphql.createProduct();
      await graphql.addToCart(kept, 2);
      await graphql.addToCart(removed, 1);

      // when
      const response = await graphql.client.execute(REMOVE_CART_ITEM, { productId: String(removed.id) });

      // then
      const { removeCartItem } = await expectData<{ removeCartItem: GqlCart }>(response);
      expectCart(removeCartItem, graphql.customer.user.username, [{ product: kept, quantity: 2 }]);
      await graphql.expectSavedCart([{ product: kept, quantity: 2 }]);
    });

    test('forbids removing from another customer cart - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const other = await graphql.createCustomer();
      await graphql.addToCart(product, 1, other.client);

      // when
      const response = await graphql.client.execute(REMOVE_CART_ITEM, {
        productId: String(product.id), username: other.user.username,
      });

      // then
      await expectFieldError(response, { field: 'removeCartItem', code: 'FORBIDDEN' });
      await graphql.expectSavedCart([{ product, quantity: 1 }], other);
    });

    test('reports a product that is not in the cart - NOT_FOUND', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphql.client.execute(REMOVE_CART_ITEM, { productId: String(product.id) });

      // then
      await expectFieldError(response, { field: 'removeCartItem', code: 'NOT_FOUND', message: 'Cart item not found' });
    });
  });

  test.describe('Mutation.clearCart', () => {
    test('empties every line of the own cart', async ({ graphql }) => {
      // given
      const first = await graphql.createProduct();
      const second = await graphql.createProduct();
      await graphql.addToCart(first, 1);
      await graphql.addToCart(second, 2);

      // when
      const response = await graphql.client.execute(CLEAR_CART);

      // then
      const { clearCart } = await expectData<{ clearCart: GqlCart }>(response);
      expectCart(clearCart, graphql.customer.user.username, []);
      await graphql.expectSavedCart([]);
    });

    test('lets an administrator clear a named customer cart', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      await graphql.addToCart(product, 1);

      // when
      const response = await graphqlAdmin.execute(CLEAR_CART, { username: graphql.customer.user.username });

      // then
      await expectData(response);
      await graphql.expectSavedCart([]);
    });

    test('forbids clearing another customer cart - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();
      const other = await graphql.createCustomer();
      await graphql.addToCart(product, 1, other.client);

      // when
      const response = await graphql.client.execute(CLEAR_CART, { username: other.user.username });

      // then
      await expectFieldError(response, { field: 'clearCart', code: 'FORBIDDEN' });
      await graphql.expectSavedCart([{ product, quantity: 1 }], other);
    });
  });
});
