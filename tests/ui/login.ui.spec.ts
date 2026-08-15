import { test, expect } from '@playwright/test';
import type { LoginDto } from '../../types/auth';

const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:8081';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'LocalDemoAdmin123!';
const LOGIN_URL = `${APP_BASE_URL}/login`;
const REGISTER_URL = `${APP_BASE_URL}/register`;

test.describe('Login UI tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // given
    const credentials: LoginDto = {
      username: 'admin',
      password: ADMIN_PASSWORD
    };

    // when
    await page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByTestId('login-submit-button').click();

    // then
    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should show error for empty password', async ({ page }) => {
    // given
    const credentials = {
      username: 'admin',
      password: ''
    };

    // when
    await page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByTestId('login-submit-button').click();

    // then
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // given
    const credentials: LoginDto = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };

    // when
    await page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByTestId('login-submit-button').click();

    // then
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should navigate to register page when register button is clicked', async ({ page }) => {
    // given
    // when
    await page.getByRole('button', { name: 'Register' }).click();

    // then
    await expect(page).toHaveURL(REGISTER_URL);
  });

  test('should navigate to register page when register link is clicked', async ({ page }) => {
    // given
    // when
    await page.getByRole('link', { name: 'Register' }).click();

    // then
    await expect(page).toHaveURL(REGISTER_URL);
  });

  test('should have proper form validation for short username', async ({ page }) => {
    // given
    const credentials = {
      username: 'abc',
      password: ADMIN_PASSWORD
    };

    // when
    await page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByTestId('login-submit-button').click();

    // then
    await expect(page).toHaveURL(LOGIN_URL);
  });

}); 
