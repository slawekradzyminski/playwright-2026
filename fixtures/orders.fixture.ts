import { test as base, expect } from './products.fixture';
import { registerAndLoginUser, type LoggedInUser } from './loggedInUser.fixture';
import { ProductClient } from '../http/productClient';
import { UserClient } from '../http/userClient';
import { CartClient } from '../http/cartClient';
import { OrderClient } from '../http/orderClient';
import { generateProduct } from '../generators/productGenerator';
import type { ProductDto } from '../types/product';
import type { OrderDto } from '../types/order';
import { expectOrder } from '../validators/orderResponse';

export const shippingAddress = { street: 'Test Street', city: 'Warsaw', state: 'Mazovia', zipCode: '00-001', country: 'PL' };
export const missingOrderId = '9223372036854775807';
export type OrderSetup = {
  owner: LoggedInUser;
  other: LoggedInUser;
  products: [ProductDto, ProductDto];
  fillCart: (user?: LoggedInUser) => Promise<void>;
  createOrder: (user?: LoggedInUser) => Promise<OrderDto>;
};

export const test = base.extend<{ orderSetup: OrderSetup }>({
  // Owned users are deleted before productIds teardown, removing cart AND order references.
  orderSetup: async ({ request, adminToken, productIds }, use) => {
    const users: LoggedInUser[] = [];
    const products: ProductDto[] = [];
    const orders = new OrderClient(request);
    const carts = new CartClient(request);
    const catalog = new ProductClient(request);
    const accounts = new UserClient(request);
    const createdOrders: number[] = [];
    try {
      users.push(await registerAndLoginUser(request));
      users.push(await registerAndLoginUser(request));
      for (const price of [12.34, 5.67]) {
        const response = await catalog.createProduct(generateProduct({ price, stockQuantity: 20 }), adminToken);
        const product = await response.json() as ProductDto;
        if (product.id) productIds.add(product.id);
        expect(response.status()).toBe(201);
        products.push(product);
      }
      const fillCart = async (user = users[0]) => {
        for (const [index, product] of products.entries()) {
          expect((await carts.addItem({ productId: product.id, quantity: index + 2 }, user.token)).status()).toBe(200);
        }
      };
      const createOrder = async (user = users[0]) => {
        await fillCart(user);
        const response = await orders.create(shippingAddress, user.token);
        const body = await response.json() as OrderDto;
        if (body.id) createdOrders.push(body.id);
        return await expectOrder(response, user.user.username, products, shippingAddress, 'PENDING', 201);
      };
      await use({ owner: users[0], other: users[1], products: [products[0], products[1]], fillCart, createOrder });
    } finally {
      const cleanup = await Promise.allSettled(users.map(async user => {
        const response = await accounts.deleteUser(user.user.username, adminToken);
        expect([204, 404], `Delete owned user and orders: ${user.user.username}`).toContain(response.status());
      }));
      expect(cleanup.filter(result => result.status === 'rejected'), 'All owned order users removed').toEqual([]);
      for (const id of createdOrders) expect((await orders.get(id, adminToken)).status(), `Removed order ${id}`).toBe(404);
    }
  }
});
export { expect } from '@playwright/test';
