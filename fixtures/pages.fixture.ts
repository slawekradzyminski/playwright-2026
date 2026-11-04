import { test as base } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { QrCodePage } from '../pages/QrCodePage';
import { RegisterPage } from '../pages/RegisterPage';

type Pages = {
  adminPage: AdminPage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  homePage: HomePage;
  registerPage: RegisterPage;
  qrCodePage: QrCodePage;
};

export const test = base.extend<Pages>({
  adminPage: async ({ page }, use) => use(new AdminPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  qrCodePage: async ({ page }, use) => use(new QrCodePage(page)),
});

export { expect } from '@playwright/test';
