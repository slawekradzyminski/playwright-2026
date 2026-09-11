import { test } from '../../fixtures/ui-fixture';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../test-config';

const admin = { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
const invalid = { username: 'invaliduser', password: 'invalidpassword' };

test.describe('Login screen', () => {
  test('signs in with valid credentials', async ({ loginPage, homePage }) => {
    // given
    await loginPage.open();
    await loginPage.fillCredentials(admin);

    // when
    await loginPage.submit();

    // then
    await homePage.expectUrl();
    await homePage.expectAuthenticated();
  });

  test('requires credentials before signing in', async ({ loginPage }) => {
    // given
    await loginPage.open();

    // when
    await loginPage.submit();

    // then
    await loginPage.expectUrl();
    await loginPage.expectRequiredCredentials();
  });

  test('shows a useful error for invalid credentials', async ({ loginPage }) => {
    // given
    await loginPage.open();
    await loginPage.fillCredentials(invalid);

    // when
    await loginPage.submit();

    // then
    await loginPage.toast.expectError('Invalid username/password');
  });

  test('opens registration from the form', async ({ loginPage, registerPage }) => {
    // given
    await loginPage.open();

    // when
    await loginPage.goToRegister();

    // then
    await registerPage.expectUrl();
    await registerPage.expectTitle();
  });

  test('opens password recovery', async ({ loginPage, forgotPasswordPage }) => {
    // given
    await loginPage.open();

    // when
    await loginPage.goToPasswordRecovery();

    // then
    await forgotPasswordPage.expectUrl();
    await forgotPasswordPage.expectTitle();
  });

});
