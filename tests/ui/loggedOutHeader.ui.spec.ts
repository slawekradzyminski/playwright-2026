import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';

test.describe('Logged-out header navigation', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  test('should navigate to register using the header link', async () => {
    // given
    await loginPage.goto();

    // when
    await loginPage.header.registerLink.click();

    // then
    await registerPage.assertLoaded();
  });

  test('should navigate to login using the header link', async () => {
    // given
    await registerPage.goto();

    // when
    await registerPage.header.loginLink.click();

    // then
    await loginPage.assertLoaded();
  });

  test('should navigate to login using the logo while logged out', async () => {
    // given
    await registerPage.goto();

    // when
    await registerPage.header.homeLink.click();

    // then
    await loginPage.assertLoaded();
  });
});
