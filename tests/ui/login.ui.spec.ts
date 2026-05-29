import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import type { LoginDto } from '../../types/auth';
import { ADMIN_PASSWORD } from '../../config/constants';

test.describe('Login UI tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // given
    const credentials: LoginDto = {
      username: 'admin',
      password: ADMIN_PASSWORD
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).not.toHaveURL(loginPage.loginUrl);
  });

  test('should show error for empty password', async ({ page }) => {
    // given
    const credentials = {
      username: 'admin',
      password: ''
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.loginUrl);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // given
    const credentials: LoginDto = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.loginUrl);
  });

  test('should navigate to register page when register button is clicked', async ({ page }) => {
    // given
    // when
    await loginPage.clickRegisterButton();

    // then
    await expect(page).toHaveURL(loginPage.registerUrl);
  });

  test('should navigate to register page when register link is clicked', async ({ page }) => {
    // given
    // when
    await loginPage.clickRegisterLink();

    // then
    await expect(page).toHaveURL(loginPage.registerUrl);
  });

  test('should have proper form validation for short username', async ({ page }) => {
    // given
    const credentials = {
      username: 'abc',
      password: ADMIN_PASSWORD
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.loginUrl);
  });

}); 
