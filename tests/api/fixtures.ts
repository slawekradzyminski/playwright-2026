import { test as base, expect } from '@playwright/test';
import { CartTestContext } from './cart/cart-test-context';
import { ApiTestContext } from './support/api-test-context';

export const test = base.extend<{ api: ApiTestContext; cart: CartTestContext }>({
  api: async ({ request }, use) => {
    const context = new ApiTestContext(request);
    try {
      await use(context);
    } finally {
      await context.cleanup();
    }
  },
  cart: async ({ request, api }, use) => {
    await use(await CartTestContext.create(request, api));
  },
});

export { expect };
