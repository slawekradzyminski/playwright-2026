import { test as base, expect } from '@playwright/test';
import { LoginClient } from '../http/loginClient';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../test-config';
import { expectValidLoginResponse } from '../validators/authResponse';
import type { LoginResponseDto } from '../types/auth';
import { ProductFactory } from '../factories/productFactory';
import { AccountFactory, type LoggedInUser } from '../factories/accountFactory';

type Resources = {
  loggedInAdmin: LoginResponseDto;
  adminToken: string;
  productFactory: ProductFactory;
  accountFactory: AccountFactory;
  loggedInUser: LoggedInUser;
};

export const test = base.extend<Resources>({
  loggedInAdmin: async ({ request }, use) => {
    const auth = await expectValidLoginResponse(await new LoginClient(request).signIn({
      username: ADMIN_USERNAME, password: ADMIN_PASSWORD
    }), ADMIN_USERNAME);
    expect(auth.roles).toContain('ROLE_ADMIN');
    await use(auth);
  },
  adminToken: async ({ loggedInAdmin }, use) => { await use(loggedInAdmin.token); },
  productFactory: async ({ request, adminToken }, use) => {
    const factory = new ProductFactory(request, adminToken);
    try {
      await use(factory);
    } finally {
      await factory.cleanup();
    }
  },
  accountFactory: async ({ request, adminToken, productFactory }, use) => {
    // Accounts remove cart/order references before the product owner tears down.
    // Depending on the factory does not create any products.
    void productFactory;
    const factory = new AccountFactory(request, adminToken);
    try {
      await use(factory);
    } finally {
      await factory.cleanup();
    }
  },
  loggedInUser: async ({ accountFactory }, use) => { await use(await accountFactory.create()); }
});

export { expect } from '@playwright/test';
