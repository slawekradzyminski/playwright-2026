import { test, expect } from '../../fixtures/ui/loginUi.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { RegisterPage } from '../../pages/RegisterPage';

test.describe('Login UI tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should successfully login with valid credentials', async ({ registeredUser, page }) => {
    // given
    const homePage = new HomePage(page);
    await loginPage.goto();

    // when
    await loginPage.login(registeredUser);

    // then
    await expect(page).toHaveURL('/');
    await expect(homePage.profileLink).toHaveText(`${registeredUser.firstName} ${registeredUser.lastName}`);
    await expect(homePage.profileLink).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // given
    const credentials = { username: 'wrong_username', password: 'wrong_password' };
    await loginPage.goto();

    // when
    await loginPage.login(credentials);

    // then
    await loginPage.toast.assertError('Invalid username/password');
    await expect(page).toHaveURL('/login');
  });

  for (const scenario of [
    { name: 'empty password', username: 'validation.user', password: '', field: 'passwordError', message: 'Password is required' },
    { name: 'short username', username: 'abc', password: 'ValidPassword123!', field: 'usernameError', message: 'Username must be at least 4 characters' }
  ] as const) {
    test(`should show validation error for ${scenario.name}`, async ({ page }) => {
      // given
      await loginPage.goto();

      // when
      await loginPage.login(scenario);

      // then
      await expect(loginPage[scenario.field]).toHaveText(scenario.message);
      await expect(loginPage[scenario.field]).toBeVisible();
      await expect(page).toHaveURL('/login');
    });
  }

  for (const control of ['registerButton', 'registerLink'] as const) {
    test(`should navigate to register page using ${control}`, async ({ page }) => {
      // given
      const registerPage = new RegisterPage(page);
      await loginPage.goto();

      // when
      await loginPage[control].click();

      // then
      await expect(page).toHaveURL('/register');
      await expect(registerPage.root).toBeVisible();
    });
  }
});
