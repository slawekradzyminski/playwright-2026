import { test, adminTest, expect } from '../fixtures';
import { HomePage } from '../../../pages/home.page';
import { DesktopLoggedInHeader } from '../../../pages/components/desktop-logged-in-header.component';
import { LoginPage } from '../../../pages/login.page';

test.describe('Logged-in header', () => {
  let home: HomePage;
  let header: DesktopLoggedInHeader;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    header = new DesktopLoggedInHeader(page);
    await home.goto();
    await expect(header.logoutButton).toBeVisible();
  });

  test('shows the client identity and authenticated actions', async ({ authenticatedUser }) => {
    // then
    await expect(header.profileLink).toHaveText(`${authenticatedUser.firstName} ${authenticatedUser.lastName}`);
    await expect(header.root.getByTestId('login-link')).toBeHidden();
    await expect(header.root.getByTestId('register-link')).toBeHidden();
  });

  test('does not expose the admin link to a client', async () => {
    // then
    await expect(header.adminLink).toHaveCount(0);
  });

  test('opens products', async ({ page }) => {
    // when
    await header.openProducts();
    // then
    await expect(page).toHaveURL('/products');
    await expect(page.getByTestId('products-title')).toHaveText('Products');
  });

  test('opens email', async ({ page }) => {
    // when
    await header.openEmail();
    // then
    await expect(page).toHaveURL('/email');
    await expect(page.getByTestId('email-page-title')).toHaveText('Send Email');
  });

  test('opens QR codes', async ({ page }) => {
    // when
    await header.openQr();
    // then
    await expect(page).toHaveURL('/qr');
    await expect(page.getByTestId('qr-code-title')).toHaveText('QR Code Generator');
  });

  test('opens the AI workspace', async ({ page }) => {
    // when
    await header.openLlm();
    // then
    await expect(page).toHaveURL('/llm');
    await expect(page.getByTestId('llm-mode-grid')).toBeVisible();
  });

  test('opens traffic monitoring', async ({ page }) => {
    // when
    await header.openTraffic();
    // then
    await expect(page).toHaveURL('/traffic');
    await expect(page.getByTestId('traffic-title')).toHaveText('Traffic Monitor');
  });

  test('opens the empty cart of its own user', async ({ page }) => {
    // when
    await header.openCart();
    // then
    await expect(page).toHaveURL('/cart');
    await expect(page.getByTestId('cart-page-container')).toContainText('Your cart is empty');
  });

  test('opens the signed-in profile', async ({ page, authenticatedUser }) => {
    // when
    await header.openProfile();
    // then
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue(authenticatedUser.email);
  });

  test('returns home using the brand link', async () => {
    // given
    await header.openQr();
    // when
    await header.openHome();
    // then
    await home.expectUrl();
    await expect(home.root).toBeVisible();
  });

  test('signs out and prevents reopening the protected homepage', async ({ page }) => {
    // given
    const login = new LoginPage(page);
    // when
    await header.logout();
    // then
    await login.expectUrl();
    await expect(login.submitButton).toBeVisible();
    await expect(page.getByTestId('navigation').getByTestId('login-link')).toBeVisible();
    await expect.poll(() => page.evaluate(() => [localStorage.getItem('token'), localStorage.getItem('refreshToken')])).toEqual([null, null]);
    await home.goto();
    await login.expectUrl();
    await expect(login.submitButton).toBeVisible();
  });
});

adminTest('opens the dashboard from the admin header link', async ({ page }) => {
  // given
  const home = new HomePage(page);
  const header = new DesktopLoggedInHeader(page);
  await home.goto();
  await expect(header.adminLink).toBeVisible();

  // when
  await header.openAdmin();

  // then
  await expect(page).toHaveURL('/admin');
  await expect(page.getByTestId('admin-dashboard-title')).toHaveText('Admin Dashboard');
});
