import { test, expect } from '../../../fixtures/carts.fixture';
import { CartClient } from '../../../http/cartClient';
import { expectCart } from '../../../validators/cartResponse';
import { cartItem, seedCart, cartUnauthorizedCases } from './cart-helpers';

let client: CartClient;
test.beforeEach(({ request }) => { client = new CartClient(request); });

for (const populated of [true, false]) {
  test(`204 - customer clears ${populated ? 'all lines from' : 'an empty'} cart without clearing another customer's cart`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first, second] } = cartSetup;
    await seedCart(client, owner.token, populated ? [cartItem(first, 2), cartItem(second, 1)] : []);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.clearCart(owner.token);

    // then
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
    await expectCart(await client.getCart(owner.token), owner.user.username, []);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}

for (const { label, token, message } of cartUnauthorizedCases) {
  test(`401 - reject ${label} without clearing customer carts`, async ({ cartSetup }) => {
    // given
    const { owner, other, products: [first, second] } = cartSetup;
    await seedCart(client, owner.token, [cartItem(second, 2)]);
    await seedCart(client, other.token, [cartItem(first, 1)]);

    // when
    const response = await client.clearCart(token);

    // then
    expect(response.status()).toBe(401);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toEqual({ message });
    await expectCart(await client.getCart(owner.token), owner.user.username, [cartItem(second, 2)]);
    await expectCart(await client.getCart(other.token), other.user.username, [cartItem(first, 1)]);
  });
}
