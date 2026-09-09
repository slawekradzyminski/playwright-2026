import { test, expect, shippingAddress } from '../../../fixtures/orders.fixture';
import { OrderClient } from '../../../http/orderClient';
import { CartClient } from '../../../http/cartClient';
import { ProductClient } from '../../../http/productClient';
import { expectOrder } from '../../../validators/orderResponse';
import { expectJson, expectError } from '../../../validators/jsonResponse';
import { expectCart } from '../../../validators/cartResponse';
import { cartItem } from '../cart/cart-helpers';
import { expectStocks } from './order-helpers';

let client: OrderClient;
let carts: CartClient;
let catalog: ProductClient;
test.beforeEach(({ request }) => {
  client = new OrderClient(request);
  carts = new CartClient(request);
  catalog = new ProductClient(request);
});

test('201 - checkout snapshots two lines, clears only owner cart and deducts inventory', async ({ orderSetup, adminToken }) => {
  // given
  const { owner, other, products, fillCart } = orderSetup;
  await fillCart();
  expect((await carts.addItem({ productId: products[0].id, quantity: 1 }, other.token)).status()).toBe(200);

  // when
  const response = await client.create(shippingAddress, owner.token);

  // then
  const order = await expectOrder(response, owner.user.username, products, shippingAddress, 'PENDING', 201);
  expect(await expectOrder(await client.get(order.id, owner.token), owner.user.username, products, shippingAddress)).toEqual(order);
  await expectCart(await carts.getCart(owner.token), owner.user.username, []);
  await expectCart(await carts.getCart(other.token), other.user.username, [cartItem(products[0], 1)]);
  await expectStocks(catalog, products, adminToken, [18, 17]);
});

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
for (const scenario of ['invalid address', 'empty cart'] as const) {
  test(`400 - reject ${scenario} without creating an order or changing stock`, async ({ orderSetup, adminToken }) => {
    // given
    const { owner, products, fillCart } = orderSetup;
    if (scenario === 'invalid address') await fillCart();
    const address = scenario === 'invalid address' ? { ...shippingAddress, street: '' } : shippingAddress;
    const before = await expectJson(await carts.getCart(owner.token), 200);

    // when
    const response = await client.create(address, owner.token);

    // then
    expect(await expectJson(response, 400)).toEqual(scenario === 'invalid address' ? { street: 'Street is required' } : { message: 'Cart is empty' });
    expect(await expectJson(await carts.getCart(owner.token), 200)).toEqual(before);
    expect(await expectJson(await client.list({}, owner.token), 200)).toMatchObject({ content: [], totalElements: 0 });
    await expectStocks(catalog, products, adminToken, [20, 20]);
  });
}

// BUG-010: ../../../reports/bugs/[M][D]-BUG-010-auth-orders-error-contract.md.
test('401 - reject anonymous checkout', async () => {
  // given
  const address = shippingAddress;

  // when
  const response = await client.create(address);

  // then
  await expectError(response, 401, 'Unauthorized');
});

// BUG-012: 409 is intended but undocumented; ../../../reports/bugs/[M][D]-BUG-012-checkout-stock-conflict-undocumented.md.
test('409 - unavailable second line preserves cart, both stocks and order count', async ({ orderSetup, adminToken }) => {
  // given
  const { owner, products, fillCart } = orderSetup;
  await fillCart();
  expect((await catalog.updateProduct(products[1].id, { stockQuantity: 1 }, adminToken)).status()).toBe(200);
  const before = await expectJson(await carts.getCart(owner.token), 200);

  // when
  const response = await client.create(shippingAddress, owner.token);

  // then
  await expectError(response, 409, `Insufficient stock for product ${products[1].id}`);
  expect(await expectJson(await carts.getCart(owner.token), 200)).toEqual(before);
  await expectStocks(catalog, products, adminToken, [20, 1]);
  expect(await expectJson(await client.list({}, owner.token), 200)).toMatchObject({ content: [], totalElements: 0 });
});
