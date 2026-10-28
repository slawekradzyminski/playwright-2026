import { test as base, expect } from '@playwright/test';
import { CartTestContext } from './cart/cart-test-context';
import { GraphQlTestContext } from './graphql/graphql-test-context';
import type { GraphQlClient } from '../../http/graphql-client';
import { OrderTestContext } from './orders/order-test-context';
import { TrafficTestContext } from './traffic/traffic-test-context';
import { ApiTestContext } from './support/api-test-context';

interface ApiFixtures {
  api: ApiTestContext;
  cart: CartTestContext;
  graphql: GraphQlTestContext;
  graphqlAdmin: GraphQlClient;
  orders: OrderTestContext;
  traffic: TrafficTestContext;
}

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    const context = new ApiTestContext(request);
    try {
      await use(context);
    } finally {
      await context.cleanup();
    }
  },
  traffic: async ({ request, api }, use) => {
    await use(await TrafficTestContext.create(request, api));
  },
  orders: async ({ request, api }, use) => {
    await use(await OrderTestContext.create(request, api));
  },
  cart: async ({ request, api }, use) => {
    await use(await CartTestContext.create(request, api));
  },
  graphql: async ({ request, api }, use) => {
    await use(await GraphQlTestContext.create(request, api));
  },
  graphqlAdmin: async ({ api }, use) => {
    await use(await api.adminGraphql());
  },
});

export { expect };
