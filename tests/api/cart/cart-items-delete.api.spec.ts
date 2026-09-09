import { expectJson } from '../../../validators/jsonResponse';
import { test, expect } from '../../../fixtures/carts.fixture';
import { CartClient } from '../../../http/cartClient';
import { expectCart } from '../../../validators/cartResponse';
import { cartItem, seedCart, cartUnauthorizedCases } from './cart-helpers';

let client: CartClient;
test.beforeEach(({ request }) => { client = new CartClient(request); });

test('200 - customer removes only the selected line from its own cart', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first, second] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(first, 2), cartItem(second, 1)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.removeItem(first.id, owner.token);

  // then
  await expectCart(response, owner.user.username, [cartItem(second, 1)]);
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(second, 1)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
});

// Documentation bug BUG-006: OpenAPI advertises CartDto for 400; runtime correctly returns an error.
// See ../../../reports/bugs/[M][D]-BUG-006-cart-error-response-contract.md.
test('400 - reject malformed product ID without changing customer carts', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(first, 2)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.removeItem('not-a-number', owner.token);

  // then
  expect(await expectJson(response, 400)).toEqual({ error: 'For input string: "not-a-number"' });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
});

// Documentation bug BUG-006: OpenAPI advertises CartDto for 401; runtime correctly returns an error.
// See ../../../reports/bugs/[M][D]-BUG-006-cart-error-response-contract.md.
for (const { label, token, message } of cartUnauthorizedCases) {
  test(`401 - reject ${label} without changing customer carts`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(first, 2)]);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.removeItem(first.id, token);

    // then
    expect(await expectJson(response, 401)).toEqual({ message });
    await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

test('404 - customer cannot remove a line present only in another cart', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first, second] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(second, 2)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.removeItem(first.id, owner.token);

  // then
  expect(await expectJson(response, 404)).toEqual({ message: 'Cart item not found' });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(second, 2)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
});
