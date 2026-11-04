import { test as base } from '@playwright/test';
import { AdminPage } from '../pages/admin/AdminPage';
import { CartPage } from '../pages/shop/CartPage';
import { CheckoutPage } from '../pages/shop/CheckoutPage';
import { EmailPage } from '../pages/tools/EmailPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProductsPage } from '../pages/shop/ProductsPage';
import { ProfilePage } from '../pages/users/ProfilePage';
import { QrCodePage } from '../pages/tools/QrCodePage';
import { RegisterPage } from '../pages/auth/RegisterPage';

type Pages = {
  adminPage: AdminPage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  homePage: HomePage;
  registerPage: RegisterPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  qrCodePage: QrCodePage;
  emailPage: EmailPage;
  profilePage: ProfilePage;
};

export const test = base.extend<Pages>({
  adminPage: async ({ page }, use) => use(new AdminPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  qrCodePage: async ({ page }, use) => use(new QrCodePage(page)),
  emailPage: async ({ page }, use) => use(new EmailPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
});

export { expect } from '@playwright/test';
