import { UsersPage } from '../../pages/users-page';
import { AdminDashboardPage } from '../../pages/admin-dashboard-page';
import { TrafficMonitorPage } from '../../pages/traffic-monitor-page';
import { LlmPage } from '../../pages/llm-page';
import { QrCodePage } from '../../pages/qr-code-page';
import { EmailPage } from '../../pages/email-page';
import { CartPage } from '../../pages/cart-page';
import { ProfilePage } from '../../pages/profile-page';
import { ProductsPage } from '../../pages/products-page';
import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { HomePage } from '../../pages/home-page';
import { RegisterPage } from '../../pages/register-page';
import { ForgotPasswordPage } from '../../pages/forgot-password-page';

export const test = base.extend<{
  usersPage: UsersPage;
  emailPage: EmailPage;
  qrCodePage: QrCodePage;
  llmPage: LlmPage;
  trafficMonitorPage: TrafficMonitorPage;
  adminDashboardPage: AdminDashboardPage;
  productsPage: ProductsPage;
  profilePage: ProfilePage;
  cartPage: CartPage;
  loginPage: LoginPage;
  homePage: HomePage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
}>({
  usersPage: async ({ page }, use) => { await use(new UsersPage(page)); },
  emailPage: async ({ page }, use) => { await use(new EmailPage(page)); },
  qrCodePage: async ({ page }, use) => { await use(new QrCodePage(page)); },
  llmPage: async ({ page }, use) => { await use(new LlmPage(page)); },
  trafficMonitorPage: async ({ page }, use) => { await use(new TrafficMonitorPage(page)); },
  adminDashboardPage: async ({ page }, use) => { await use(new AdminDashboardPage(page)); },
  productsPage: async ({ page }, use) => { await use(new ProductsPage(page)); },
  profilePage: async ({ page }, use) => { await use(new ProfilePage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  homePage: async ({ page }, use) => { await use(new HomePage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  forgotPasswordPage: async ({ page }, use) => { await use(new ForgotPasswordPage(page)); },
});
