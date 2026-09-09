import { test as base } from './accounts.fixture';
import type { LoggedInUser } from './loggedInUser.fixture';
import type { ProductDto } from '../types/product';
import type { OrderDto } from '../types/order';

import { OrderFactory } from '../factories/orderFactory';

export { shippingAddress } from '../factories/orderFactory';
export const missingOrderId = '9223372036854775807';
type CustomerIdentity = 'owner' | 'other';
type OrderIdentities = { get: (identity: CustomerIdentity) => Promise<LoggedInUser> };
export type OrderSetup = {
  owner: LoggedInUser;
  other: LoggedInUser;
  products: [ProductDto, ProductDto];
  fillCart: (user?: LoggedInUser) => Promise<void>;
  createOrder: (user?: LoggedInUser) => Promise<OrderDto>;
};

export const test = base.extend<{
  orderIdentities: OrderIdentities;
  orderProducts: [ProductDto, ProductDto];
  orderSetup: OrderSetup;
}>({
  orderIdentities: async ({ accountFactory }, use) => {
    const identities = new Map<CustomerIdentity, Promise<LoggedInUser>>();
    await use({ get: identity => {
      if (!identities.has(identity)) identities.set(identity, accountFactory.create());
      return identities.get(identity)!;
    } });
  },
  orderProducts: async ({ productFactory }, use) => {
    const first = await productFactory.create({ price: 12.34, stockQuantity: 20 });
    const second = await productFactory.create({ price: 5.67, stockQuantity: 20 });
    await use([first, second]);
  },
  orderSetup: async ({ request, orderIdentities, orderProducts }, use) => {
    const owner = await orderIdentities.get('owner');
    const other = await orderIdentities.get('other');
    const factory = new OrderFactory(request, owner, orderProducts);
    await use({ owner, other, products: orderProducts, fillCart: factory.fillCart, createOrder: factory.create });
  }
});

export { expect } from '@playwright/test';
