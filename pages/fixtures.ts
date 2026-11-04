import { test as base } from '@playwright/test';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

type Pages = {
  loginPage: LoginPage;
  homePage: HomePage;
  registerPage: RegisterPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
});

export { expect } from '@playwright/test';
