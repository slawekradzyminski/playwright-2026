import { test, expect } from '../../../fixtures/carts.fixture';
import { CartClient } from '../../../http/cartClient';
import { ADMIN_USERNAME } from '../../../test-config';
import { expectCart } from '../../../validators/cartResponse';
import { cartItem, seedCart, cartUnauthorizedCases } from './cart-helpers';

let client: CartClient;
test.beforeEach(({ request }) => { client = new CartClient(request); });

for (const populated of [false, true]) {
  test(`200 - customer reads ${populated ? 'populated' : 'empty'} cart without another customer's items`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first, second] } = cartSetup;
    const items = populated ? [cartItem(first, 2), cartItem(second, 1)] : [];
    await seedCart(client, owner.token, items);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.getCart(owner.token);

    // then
    await expectCart(response, owner.user.username, items);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

test('200 - admin can read its own cart', async ({ adminToken }) => {
  // given
  const token = adminToken;

  // when
  const response = await client.getCart(token);

  // then
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const cart = await response.json();
  expect(cart.username).toBe(ADMIN_USERNAME);
  expect(Array.isArray(cart.items)).toBe(true);
  for (const item of cart.items) {
    expect(Number.isInteger(item.productId)).toBe(true);
    expect(Number.isInteger(item.quantity)).toBe(true);
    expect(item.quantity).toBeGreaterThan(0);
  }
  expect(cart.totalItems).toBe(cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
  expect(typeof cart.totalPrice).toBe('number');
  expect(cart.totalPrice).toBeGreaterThanOrEqual(0);
});

// Documentation bug BUG-006: OpenAPI advertises CartDto for 401; runtime correctly returns an error.
// See ../../../reports/bugs/BUG-006-cart-error-response-contract.md.
for (const { label, token, message } of cartUnauthorizedCases) {
  test(`401 - reject ${label} without changing customer carts`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(first, 2)]);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.getCart(token);

    // then
    expect(response.status()).toBe(401);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toEqual({ message });
    await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

