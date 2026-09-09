import { test as base, expect } from '../../fixtures/orders.fixture';
import { authStorageState } from './authStorageState';
import { LoginClient } from '../../http/loginClient';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../test-config';
import { expectValidLoginResponse } from '../../validators/authResponse';

export { missingOrderId, shippingAddress } from '../../fixtures/orders.fixture';

type OrderIdentity = 'owner' | 'other' | 'admin';

export const test = base.extend<{ orderIdentity: OrderIdentity }>({
  orderIdentity: ['owner', { option: true }],
  storageState: async ({ baseURL, orderIdentity, orderSetup, request }, use) => {
    if (orderIdentity === 'admin') {
      const authentication = await expectValidLoginResponse(await new LoginClient(request).signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }), ADMIN_USERNAME);
      expect(authentication.roles).toContain('ROLE_ADMIN');
      await use(authStorageState(baseURL, authentication));
      return;
    }
    const authentication = orderIdentity === 'owner' ? orderSetup.owner : orderSetup.other;
    await use(authStorageState(baseURL, authentication));
  }
});

export { expect } from '@playwright/test';
