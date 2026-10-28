import { test, expect } from '../fixtures';
import { HomePage } from '../../../pages/home.page';

test.describe('Homepage', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('keeps the API-authenticated user signed in after reload', async ({ authenticatedUser }) => {
    // given
    await expect(home.welcomeTitle).toHaveText(`Welcome, ${authenticatedUser.firstName}!`);

    // when
    await home.reload();

    // then
    await home.expectUrl();
    await expect(home.welcomeTitle).toHaveText(`Welcome, ${authenticatedUser.firstName}!`);
    await expect(home.userEmail).toHaveText(authenticatedUser.email);
  });

  test('opens the product catalog', async ({ page }) => {
    // when
    await home.openProducts();
    // then
    await expect(page).toHaveURL('/products');
    await expect(page.getByTestId('products-title')).toHaveText('Products');
  });

  test('opens users', async ({ page, authenticatedUser }) => {
    // when
    await home.openUsers();
    // then
    await expect(page).toHaveURL('/users');
    await expect(page.getByTestId('users-title')).toHaveText('Users');
    await expect(page.getByTestId('users-list')).toContainText(authenticatedUser.username);
    await expect(page.getByTestId('users-error')).toBeHidden();
  });

  test('opens profile and orders', async ({ page, authenticatedUser }) => {
    // when
    await home.openProfile();
    // then
    await expect(page).toHaveURL('/profile');
    await expect(page.getByTestId('profile-title')).toHaveText('Profile');
    await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue(authenticatedUser.email);
  });

  test('opens the AI workspace', async ({ page }) => {
    // when
    await home.openLlm();
    // then
    await expect(page).toHaveURL('/llm');
    await expect(page.getByTestId('llm-mode-grid')).toBeVisible();
  });

  test('opens the traffic monitor', async ({ page }) => {
    // when
    await home.openTraffic();
    // then
    await expect(page).toHaveURL('/traffic');
    await expect(page.getByTestId('traffic-title')).toHaveText('Traffic Monitor');
  });

  test('opens the QR generator', async ({ page }) => {
    // when
    await home.openQr();
    // then
    await expect(page).toHaveURL('/qr');
    await expect(page.getByTestId('qr-code-title')).toHaveText('QR Code Generator');
  });

  test('opens the email form', async ({ page }) => {
    // when
    await home.openEmail();
    // then
    await expect(page).toHaveURL('/email');
    await expect(page.getByTestId('email-page-title')).toHaveText('Send Email');
  });

  test('opens products with the keyboard', async ({ page }) => {
    // given
    await home.productsButton.focus();
    // when
    await page.keyboard.press('Enter');
    // then
    await expect(page).toHaveURL('/products');
    await expect(page.getByTestId('products-title')).toHaveText('Products');
  });
});
