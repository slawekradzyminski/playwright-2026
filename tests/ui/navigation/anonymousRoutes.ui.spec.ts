import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });
let login: LoginPage;

test.beforeEach(({ page }) => {
  login = new LoginPage(page);
});

const routes = ['/admin', '/admin/products', '/admin/products/new', '/admin/products/edit/1', '/admin/orders', '/admin/inventory', '/admin/inventory/1', '/profile', '/orders', '/orders/1', '/cart', '/checkout'];

for (const route of routes) {
  test(`redirects ${route} to login`, async ({ page }) => {
    // given: no authenticated session

    // when
    await page.goto(route);

    // then
    await login.assertLoaded();
    await expect(login.usernameInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
  });
}
