import { test } from '../../fixtures/ui/pages';

test.describe('Logged-out header', () => {
  test('redirects a guest from home to sign in', async ({ homePage, loginPage }) => {
    // given
    await loginPage.open();

    // when
    await homePage.open();

    // then
    await loginPage.expectUrl();
    await loginPage.header.expectVisible();
  });

  test('opens registration', async ({ loginPage, registerPage }) => {
    // given
    await loginPage.open();

    // when
    await loginPage.header.goToRegister();

    // then
    await registerPage.expectUrl();
    await registerPage.expectTitle();
    await registerPage.header.expectVisible();
  });

  test('opens login from registration', async ({ registerPage, loginPage }) => {
    // given
    await registerPage.open();

    // when
    await registerPage.header.goToLogin();

    // then
    await loginPage.expectUrl();
    await loginPage.header.expectVisible();
  });

  test('returns to login through the brand', async ({ registerPage, loginPage }) => {
    // given
    await registerPage.open();

    // when
    await registerPage.header.goHome();

    // then
    await loginPage.expectUrl();
    await loginPage.header.expectVisible();
  });
});
