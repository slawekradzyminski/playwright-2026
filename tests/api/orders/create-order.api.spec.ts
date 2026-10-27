import { test, expect } from '../fixtures';
import { OrdersClient } from '../../../http/orders-client';
import type { OrderDto, OrderPageDto } from '../../../types/order';
import { expectOrder } from './order-assertions';
import { shippingAddress } from './order-test-context';

test.describe('POST /api/v1/orders', () => {
  test('persists the order, clears the cart and deducts stock - 201', async ({ orders }) => {
    // given
    const { product, quantity } = await orders.fillCart({ price: 12.34, stockQuantity: 9 });

    // when
    const response = await orders.client.create(shippingAddress);

    // then
    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    const order: OrderDto = await response.json();
    expectOrder(order, orders.user.username, product, quantity, shippingAddress);
    await orders.expectStored(order, 'PENDING');
    await orders.expectCart([]);
    await orders.expectStock(product, product.stockQuantity - quantity);
  });

  test('rejects an empty cart - 400', async ({ orders }) => {
    // when
    const response = await orders.client.create(shippingAddress);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Cart is empty' });
  });

  test('rejects an invalid postal code without changing cart or stock - 400', async ({ orders }) => {
    // given
    const { product, quantity } = await orders.fillCart();

    // when
    const response = await orders.client.create({ ...shippingAddress, zipCode: 'invalid' });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ zipCode: 'Invalid postal/zip code format' });
    await orders.expectCart([{ product, quantity }]);
    await orders.expectStock(product, product.stockQuantity);
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OrdersClient(request).create(shippingAddress);

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects insufficient stock without partial checkout - 409', async ({ api, orders }) => {
    // given
    const { product, quantity } = await orders.fillCart({ stockQuantity: 2 });
    expect((await (await api.adminProducts()).update(product.id, { stockQuantity: 1 })).status()).toBe(200);

    // when
    const response = await orders.client.create(shippingAddress);

    // then
    expect(response.status()).toBe(409);
    expect(await response.json()).toEqual({ message: `Insufficient stock for product ${product.id}` });
    await orders.expectCart([{ product, quantity }]);
    await orders.expectStock(product, 1);
    const stored = await orders.client.getMine();
    expect(stored.status()).toBe(200);
    expect((await stored.json() as OrderPageDto).content).toEqual([]);
  });
});
