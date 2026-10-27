import { test, adminTest, expect } from '../fixtures';
import { HomePage } from '../../../pages/home.page';
import { LoginPage } from '../../../pages/login.page';
import { MobileLoggedInHeader } from '../../../pages/components/mobile/logged-in-header.component';

test.describe('Logged-in mobile header', () => {
  test.use({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true });

  test('opens products from the menu and closes it after navigation', async ({ page }) => {
    // given
    const home = new HomePage(page);
    const header = new MobileLoggedInHeader(page);
    await home.goto();
    await header.toggleMenu();
    await expect(header.menu).toBeVisible();
    await expect(header.adminLink).toHaveCount(0);
    // when
    await header.openProducts();
    // then
    await expect(page).toHaveURL('/products');
    await expect(page.getByTestId('products-title')).toHaveText('Products');
    await expect(header.menu).toBeHidden();
  });

  test('signs out from the mobile menu', async ({ page }) => {
    // given
    const home = new HomePage(page);
    const header = new MobileLoggedInHeader(page);
    await home.goto();
    await header.toggleMenu();
    // when
    await header.logout();
    // then
    const login = new LoginPage(page);
    await login.expectUrl();
    await expect(login.submitButton).toBeVisible();
    await expect(header.menuToggle).toBeHidden();
  });
});

adminTest.describe('Mobile admin header', () => {
  adminTest.use({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true });

  adminTest('opens the dashboard from the admin menu link', async ({ page }) => {
    // given
    const home = new HomePage(page);
    const header = new MobileLoggedInHeader(page);
    await home.goto();
    await header.toggleMenu();
    await expect(header.adminLink).toBeVisible();

    // when
    await header.openAdmin();

    // then
    await expect(page).toHaveURL('/admin');
    await expect(page.getByTestId('admin-dashboard-title')).toHaveText('Admin Dashboard');
    await expect(header.menu).toBeHidden();
  });
});
