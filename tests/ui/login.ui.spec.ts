import { test, expect } from '../api/fixtures';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../test-config';
import { HomePage } from '../../pages/home.page';
import { LoginPage } from '../../pages/login.page';
import { RegisterPage } from '../../pages/register.page';

test.describe('Login UI', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('signs in with valid credentials', async ({ page, api }) => {
    // given
    const homePage = new HomePage(page);
    const { user } = await api.createUser();

    // when
    await loginPage.login(user.username, user.password);

    // then
    await homePage.expectUrl();
    await expect(homePage.root).toBeVisible();
    await expect(homePage.userEmail).toHaveText(user.email);
  });

  test('shows a validation error for an empty password', async () => {
    // given
    const credentials = { username: ADMIN_USERNAME, password: '' };

    // when
    await loginPage.login(credentials.username, credentials.password);

    // then
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await loginPage.expectUrl();
  });

  test('shows an error toast for invalid credentials', async () => {
    // given
    const credentials = { username: 'invaliduser', password: 'invalidpassword' };

    // when
    await loginPage.login(credentials.username, credentials.password);

    // then
    await loginPage.toast.expectDescription('Invalid username/password');
    await loginPage.expectUrl();
  });

  test('opens registration from the login form', async ({ page }) => {
    // given
    const registerPage = new RegisterPage(page);

    // when
    await loginPage.openRegistration();

    // then
    await registerPage.expectUrl();
    await expect(registerPage.root).toBeVisible();
  });

  test('opens registration from the logged-out header', async ({ page }) => {
    // given
    const registerPage = new RegisterPage(page);

    // when
    await loginPage.header.openRegistration();

    // then
    await registerPage.expectUrl();
    await expect(registerPage.root).toBeVisible();
  });

  test('exposes form labels and supports keyboard navigation', async ({ page }) => {
    // given
    await loginPage.usernameInput.focus();

    // when
    await page.keyboard.press('Tab');

    // then
    await expect(loginPage.usernameInput).toHaveAccessibleName('Username');
    await expect(loginPage.passwordInput).toHaveAccessibleName('Password');
    await expect(loginPage.submitButton).toHaveAccessibleName('Sign in');
    await expect(loginPage.passwordInput).toBeFocused();
  });

  test('shows a validation error for a short username', async () => {
    // given
    const credentials = { username: 'abc', password: ADMIN_PASSWORD };

    // when
    await loginPage.login(credentials.username, credentials.password);

    // then
    await expect(loginPage.usernameError).toHaveText('Username must be at least 4 characters');
    await loginPage.expectUrl();
  });
});
