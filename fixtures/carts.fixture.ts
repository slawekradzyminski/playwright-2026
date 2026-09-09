import { test as base } from './accounts.fixture';
import type { LoggedInUser } from './loggedInUser.fixture';
import type { ProductDto } from '../types/product';

type CartSetup = {
  owner: LoggedInUser;
  other: LoggedInUser;
  products: [ProductDto, ProductDto];
};

export const test = base.extend<{ otherCartUser: LoggedInUser; cartSetup: CartSetup }>({
  otherCartUser: async ({ accountFactory }, use) => { await use(await accountFactory.create()); },
  cartSetup: async ({ loggedInUser, otherCartUser, productFactory }, use) => {
    const first = await productFactory.create({ price: 12.34, stockQuantity: 20 });
    const second = await productFactory.create({ price: 5.67, stockQuantity: 20 });
    // accountFactory removes both customers' carts before productFactory cleanup.
    await use({ owner: loggedInUser, other: otherCartUser, products: [first, second] });
  }
});

export { expect } from '@playwright/test';
