import { test, expect } from '../fixtures';
import type { GraphQlClient } from '../../../http/graphql-client';
import { CartClient } from '../../../http/cart-client';
import type { GqlCart, GqlPage } from '../../../types/graphql';
import { expectData, expectFieldError } from './graphql-assertions';
import { expectCart } from './graphql-test-context';
import { CART, CARTS } from './queries';

// Shared environments can list other carts; page through them to find the owned one.
// Full cart selections stay below the complexity limit (1000) at 50 carts per page.
const CARTS_PAGE_SIZE = 50;

async function findListedCart(admin: GraphQlClient, username: string): Promise<GqlCart | undefined> {
  for (let page = 0; ; page++) {
    const { carts } = await expectData<{ carts: GqlPage<GqlCart> }>(await admin.execute(CARTS, { page, size: CARTS_PAGE_SIZE }));
    const owned = carts.items.find(cart => cart.username === username);
    if (owned || (page + 1) * CARTS_PAGE_SIZE >= carts.total) return owned;
  }
}

test.describe('GraphQL cart queries', () => {
  test.describe('Query.cart', () => {
    test('shows items added through REST with names, captured prices and totals', async ({ request, graphql }) => {
      // given
      const product = await graphql.createProduct({ price: 12.5 });
      const restCart = new CartClient(request, graphql.customer.token);
      expect((await restCart.addItem({ productId: product.id, quantity: 2 })).status()).toBe(200);

      // when
      const response = await graphql.client.execute(CART);

      // then
      const { cart } = await expectData<{ cart: GqlCart }>(response);
      expectCart(cart, graphql.customer.user.username, [{ product, quantity: 2 }]);
      expect(cart.totalPrice).toBe('25.00');
      expect(cart.items[0].unitPrice).toBe('12.50');
    });

    test('lets an administrator inspect a named customer cart', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      await graphql.addToCart(product, 3);

      // when
      const response = await graphqlAdmin.execute(CART, { username: graphql.customer.user.username });

      // then
      const { cart } = await expectData<{ cart: GqlCart }>(response);
      expectCart(cart, graphql.customer.user.username, [{ product, quantity: 3 }]);
    });

    test('forbids a customer from reading another customer cart - FORBIDDEN', async ({ graphql }) => {
      // given
      const other = await graphql.createCustomer();

      // when
      const response = await graphql.client.execute(CART, { username: other.user.username });

      // then
      await expectFieldError(response, { field: 'cart', code: 'FORBIDDEN', message: 'Access denied' });
    });
  });

  test.describe('Query.carts', () => {
    test('lists a customer non-empty cart for an administrator', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      await graphql.addToCart(product, 1);

      // when
      const response = await graphqlAdmin.execute(CARTS, { page: 0, size: CARTS_PAGE_SIZE });

      // then
      const { carts } = await expectData<{ carts: GqlPage<GqlCart> }>(response);
      expect(carts).toMatchObject({ page: 0, size: CARTS_PAGE_SIZE });
      expect(carts.items.every(cart => cart.totalItems > 0)).toBe(true);
      const owned = await findListedCart(graphqlAdmin, graphql.customer.user.username);
      expect(owned, 'Owned cart in the admin listing').toBeDefined();
      expectCart(owned!, graphql.customer.user.username, [{ product, quantity: 1 }]);
    });

    test('forbids customers from listing carts - FORBIDDEN', async ({ graphql }) => {
      // when
      const response = await graphql.client.execute(CARTS, { page: 0, size: 20 });

      // then
      await expectFieldError(response, { field: 'carts', code: 'FORBIDDEN', message: 'Access denied' });
    });
  });
});
