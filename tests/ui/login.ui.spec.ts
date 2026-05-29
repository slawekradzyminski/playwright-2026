import { test, expect } from '../../fixtures/ui.fixture';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import type { LoginDto } from '../../types/auth';
import { ADMIN_PASSWORD, ADMIN_USER } from '../../config/constants';

test.describe('Login UI tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    registerPage = new RegisterPage(page);
    await loginPage.goto();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // given
    const credentials: LoginDto = {
      username: ADMIN_USER.username,
      password: ADMIN_USER.password
    };

    // when
    await loginPage.login(credentials);

    // then
    await homePage.verifyLoggedInUser(ADMIN_USER);
  });

  test('should show error for empty password', async ({ page }) => {
    // given
    const credentials = {
      username: ADMIN_USER.username,
      password: ''
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.loginUrl);
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await expect(loginPage.toast.viewport).toBeEmpty();
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
    await loginPage.toast.verifyAlertFailure('Invalid username/password');
  });

  test('should navigate to register page when register button is clicked', async ({ page }) => {
    // given
    // when
    await loginPage.clickRegisterButton();

    // then
    await expect(page).toHaveURL(registerPage.registerUrl);
    await expect(registerPage.registerPage).toBeVisible();
    await expect(registerPage.title).toHaveText('Create your account');
  });

  test('should navigate to register page when register link is clicked', async ({ page }) => {
    // given
    // when
    await loginPage.clickRegisterLink();

    // then
    await expect(page).toHaveURL(registerPage.registerUrl);
    await expect(registerPage.registerPage).toBeVisible();
    await expect(registerPage.title).toHaveText('Create your account');
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
    await expect(loginPage.usernameError).toHaveText('Username must be at least 4 characters');
    await expect(loginPage.toast.viewport).toBeEmpty();
  });

}); 
