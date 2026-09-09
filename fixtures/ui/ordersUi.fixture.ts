import { test as base } from '../orders.fixture';
import { authStorageState } from './authStorageState';

export { shippingAddress } from '../orders.fixture';
// BUG-047: the UI converts route IDs to Number; use an exact integer for 404 coverage.
export const missingOrderId = String(Number.MAX_SAFE_INTEGER);
type OrderIdentity = 'owner' | 'other' | 'admin';

export const test = base.extend<{ orderIdentity: OrderIdentity }>({
  orderIdentity: ['owner', { option: true }],
  storageState: async ({ baseURL, orderIdentity, orderIdentities, loggedInAdmin }, use) => {
    const authentication = orderIdentity === 'admin'
      ? loggedInAdmin
      : await orderIdentities.get(orderIdentity);
    await use(authStorageState(baseURL, authentication));
  }
});

export { expect } from '@playwright/test';
