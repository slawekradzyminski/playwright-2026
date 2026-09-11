import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { HomePage } from '../pages/home-page';
import { RegisterPage } from '../pages/register-page';
import { ForgotPasswordPage } from '../pages/forgot-password-page';

export const test = base.extend<{
  loginPage: LoginPage;
  homePage: HomePage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
}>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  homePage: async ({ page }, use) => { await use(new HomePage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  forgotPasswordPage: async ({ page }, use) => { await use(new ForgotPasswordPage(page)); },
});
