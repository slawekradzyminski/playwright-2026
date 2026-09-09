import { test, expect } from '../../fixtures/ui/loginUi.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { RegisterPage } from '../../pages/RegisterPage';

test.describe('Login UI tests', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    homePage = new HomePage(page);
  });

  test('should successfully login with valid credentials', async ({ registeredUser }) => {
    // given
    await loginPage.goto();

    // when
    await loginPage.login(registeredUser);

    // then
    await homePage.assertLoaded();
    await expect(homePage.header.profileLink).toHaveText(`${registeredUser.firstName} ${registeredUser.lastName}`);
    await expect(homePage.header.profileLink).toBeVisible();
  });

  test('should show error for invalid credentials', async () => {
    // given
    const credentials = { username: 'wrong_username', password: 'wrong_password' };
    await loginPage.goto();

    // when
    await loginPage.login(credentials);

    // then
    await loginPage.toast.assertError('Invalid username/password');
    await loginPage.assertLoaded();
  });

  for (const scenario of [
    { name: 'empty password', username: 'validation.user', password: '', field: 'passwordError', message: 'Password is required' },
    { name: 'short username', username: 'abc', password: 'ValidPassword123!', field: 'usernameError', message: 'Username must be at least 4 characters' }
  ] as const) {
    test(`should show validation error for ${scenario.name}`, async () => {
      // given
      await loginPage.goto();

      // when
      await loginPage.login(scenario);

      // then
      await expect(loginPage[scenario.field]).toHaveText(scenario.message);
      await expect(loginPage[scenario.field]).toBeVisible();
      await loginPage.assertLoaded();
    });
  }

  test('should navigate to register page using the form button', async () => {
    // given
    await loginPage.goto();

    // when
    await loginPage.registerButton.click();

    // then
    await registerPage.assertLoaded();
  });

});
