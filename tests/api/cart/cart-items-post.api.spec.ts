import { expectJson } from '../../../validators/jsonResponse';
import { test, expect } from '../../../fixtures/carts.fixture';
import { CartClient } from '../../../http/cartClient';
import { ProductClient } from '../../../http/productClient';
import { expectCart } from '../../../validators/cartResponse';
import { cartItem, seedCart, cartUnauthorizedCases } from './cart-helpers';

let client: CartClient;
let products: ProductClient;
test.beforeEach(({ request }) => {
  client = new CartClient(request);
  products = new ProductClient(request);
});

for (const initialQuantity of [0, 2]) {
  test(`200 - customer ${initialQuantity ? 'increases an existing line' : 'adds a new line'} in its own cart`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first, second] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(second, 1), ...(initialQuantity ? [cartItem(first, initialQuantity)] : [])]);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.addItem({ productId: first.id, quantity: 2 }, owner.token);

    // then
    const expected = [cartItem(first, initialQuantity + 2), cartItem(second, 1)];
    await expectCart(response, owner.user.username, expected);
    await expectCart(await client.getCart(owner.token), owner.user.username, expected);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

// Documentation bug BUG-006: OpenAPI advertises CartDto for 400; runtime correctly returns an error.
// See ../../../reports/bugs/BUG-006-cart-error-response-contract.md.
test('400 - reject zero quantity without changing customer carts', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(first, 2)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.addItem({ productId: first.id, quantity: 0 }, owner.token);

  // then
  expect(await expectJson(response, 400)).toEqual({ quantity: 'must be greater than or equal to 1' });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
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
    const response = await client.addItem({ productId: first.id, quantity: 1 }, token);

    // then
    expect(await expectJson(response, 401)).toEqual({ message });
    await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

test('404 - deleted product cannot be added and existing cart is preserved', async ({ cartSetup, adminToken }) => {
  // given
  const { owner, products: [first, second] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(second, 2)]);
  expect((await products.deleteProduct(first.id, adminToken)).status()).toBe(204);

  // when
  const response = await client.addItem({ productId: first.id, quantity: 1 }, owner.token);

  // then
  expect(await expectJson(response, 404)).toEqual({ message: 'Product not found' });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(second, 2)]);
});

// Documentation bug BUG-007: OpenAPI omits the valid stock-conflict response.
// See ../../../reports/bugs/BUG-007-cart-stock-conflict-undocumented.md.
test('409 - reject insufficient stock and roll back the cart mutation', async ({ cartSetup }) => {
  // given
  const { owner, other, products: [first] } = cartSetup;
  await seedCart(client, owner.token, [cartItem(first, 2)]);
  await seedCart(client, other.token, [cartItem(first, 1)]);

  // when
  const response = await client.addItem({ productId: first.id, quantity: 21 }, owner.token);

  // then
  expect(await expectJson(response, 409)).toEqual({ message: `Insufficient stock for product ${first.id}` });
  await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(first, 2)]);
  await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
});
