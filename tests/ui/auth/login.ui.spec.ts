import { test, expect } from '../../../fixtures/pages.fixture';
import type { LoginDto } from '../../../types/auth';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../../test-config';

test.describe('Login UI tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should show logged out header on login page', async ({ loginPage }) => {
    // then
    await loginPage.header.expectToBeVisible();
  });

  test('should successfully login with valid credentials', async ({ loginPage, homePage }) => {
    // given
    const credentials: LoginDto = {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    };

    // when
    await loginPage.login(credentials);

    // then
    await homePage.expectToBeOpen();
    await expect(homePage.header.profileLink).toBeVisible();
  });

  test('should show error for empty password', async ({ loginPage }) => {
    // given
    const credentials: LoginDto = {
      username: ADMIN_USERNAME,
      password: ''
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await expect(loginPage.usernameError).toBeHidden();
    await loginPage.expectToBeOpen();
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    // given
    const credentials: LoginDto = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };

    // when
    await loginPage.login(credentials);

    // then
    await loginPage.toast.expectError('Invalid username/password');
    await loginPage.expectToBeOpen();
    await expect(loginPage.usernameInput).toHaveValue(credentials.username);
  });

  test('should navigate to register page when register button is clicked', async ({ loginPage, registerPage }) => {
    // when
    await loginPage.registerButton.click();

    // then
    await registerPage.expectToBeOpen();
  });

  test('should navigate to register page when register link is clicked', async ({ loginPage, registerPage }) => {
    // when
    await loginPage.header.clickRegister();

    // then
    await registerPage.expectToBeOpen();
  });

  test('should have proper form validation for short username', async ({ loginPage }) => {
    // given
    const credentials: LoginDto = {
      username: 'abc',
      password: ADMIN_PASSWORD
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(loginPage.usernameError).toHaveText('Username must be at least 4 characters');
    await expect(loginPage.passwordError).toBeHidden();
    await loginPage.expectToBeOpen();
  });
});
