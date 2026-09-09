import { expectJson } from '../../../validators/jsonResponse';
import { test, expect } from '../../../fixtures/carts.fixture';
import { CartClient } from '../../../http/cartClient';
import { expectCart } from '../../../validators/cartResponse';
import { cartItem, seedCart, cartUnauthorizedCases } from './cart-helpers';

let client: CartClient;
test.beforeEach(({ request }) => { client = new CartClient(request); });

for (const quantity of [4, 0]) {
  test(`200 - customer ${quantity ? 'replaces quantity' : 'removes a line with zero quantity'} in its own cart`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first, second] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(first, 2), cartItem(second, 1)]);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.updateItem(first.id, { quantity }, owner.token);

    // then
    const expected = [...(quantity ? [cartItem(first, quantity)] : []), cartItem(second, 1)];
    await expectCart(response, owner.user.username, expected);
    await expectCart(await client.getCart(owner.token), owner.user.username, expected);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

// Documentation bug BUG-006: OpenAPI advertises CartDto for 400; runtime correctly returns an error.
// See ../../../reports/bugs/[M][D]-BUG-006-cart-error-response-contract.md.
for (const scenario of [
  { label: 'negative quantity', malformedId: false, quantity: -1, error: { quantity: 'Quantity cannot be negative' } },
  { label: 'malformed product ID', malformedId: true, quantity: 1, error: { error: 'For input string: "not-a-number"' } }
]) {
  test(`400 - reject ${scenario.label} without changing customer carts`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(first, 2)]);
    await seedCart(client, other.token, [cartItem(first, 1)]);
    const productId = scenario.malformedId ? 'not-a-number' : first.id;

    // when
    const response = await client.updateItem(productId, { quantity: scenario.quantity }, owner.token);

    // then
    expect(await expectJson(response, 400)).toEqual(scenario.error);
    await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

// Documentation bug BUG-006: OpenAPI advertises CartDto for 401; runtime correctly returns an error.
// See ../../../reports/bugs/[M][D]-BUG-006-cart-error-response-contract.md.
for (const { label, token, message } of cartUnauthorizedCases) {
  test(`401 - reject ${label} without changing customer carts`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(first, 2)]);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.updateItem(first.id, { quantity: 1 }, token);

    // then
    expect(await expectJson(response, 401)).toEqual({ message });
    await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

test('404 - customer cannot update a line present only in another cart', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first, second] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(second, 2)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.updateItem(first.id, { quantity: 1 }, owner.token);

  // then
  expect(await expectJson(response, 404)).toEqual({ message: 'Cart item not found' });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(second, 2)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
});

// Documentation bug BUG-007: OpenAPI omits the valid stock-conflict response.
// See ../../../reports/bugs/[M][D]-BUG-007-cart-stock-conflict-undocumented.md.
test('409 - reject insufficient stock and roll back the cart mutation', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(first, 2)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.updateItem(first.id, { quantity: 21 }, owner.token);

  // then
  expect(await expectJson(response, 409)).toEqual({ message: `Insufficient stock for product ${first.id}` });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
});
