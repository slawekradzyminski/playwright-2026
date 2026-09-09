import { test as base, expect } from './ordersUi.fixture';
import { CartClient } from '../../http/cartClient';
import { ProductClient } from '../../http/productClient';
import { OrderClient } from '../../http/orderClient';
import { expectCart } from '../../validators/cartResponse';
import { expectJson } from '../../validators/jsonResponse';
import type { OrderPage } from '../../types/order';

type CheckoutStock = {
  prepare: (stock: { quantity: number; availableStock: number }) => Promise<void>;
  restock: (quantity: number) => Promise<void>;
  assertCartQuantity: (quantity: number) => Promise<void>;
  assertOrderCount: (count: number) => Promise<void>;
};

export const test = base.extend<{ checkoutStock: CheckoutStock }>({
  // orderSetup owns the customer/product and cleans up their cart and orders on failure too.
  checkoutStock: async ({ request, orderSetup, adminToken }, use) => {
    const product = orderSetup.products[0];
    const customer = orderSetup.owner;
    const cart = new CartClient(request);
    const catalog = new ProductClient(request);
    const orders = new OrderClient(request);
    const setStock = async (quantity: number) => {
      expect((await catalog.updateProduct(product.id, { stockQuantity: quantity }, adminToken)).status()).toBe(200);
    };

    await use({
      prepare: async ({ quantity, availableStock }) => {
        expect((await cart.clearCart(customer.token)).status()).toBe(204);
        expect((await cart.addItem({ productId: product.id, quantity }, customer.token)).status()).toBe(200);
        await setStock(availableStock);
      },
      restock: setStock,
      assertCartQuantity: async quantity => {
        await expectCart(await cart.getCart(customer.token), customer.user.username, [
          { productId: product.id, quantity, price: product.price }
        ]);
      },
      assertOrderCount: async count => {
        const savedOrders = await expectJson<OrderPage>(await orders.list({}, customer.token), 200);
        expect(savedOrders.totalElements).toBe(count);
      }
    });
  }
});

export { expect } from '@playwright/test';
