import { test } from '../../fixtures/ui/registration';

test.describe('Registration screen', () => {
  test('creates an account that can sign in', async ({ registerPage, loginPage, registrationUser }) => {
    // given
    await registerPage.open();
    await registerPage.fillDetails(registrationUser);

    // when
    await registerPage.submit();

    // then
    await loginPage.expectUrl();
    await loginPage.toast.expectSuccess('Registration successful! You can now log in.');
  });

  test('requires account details before registration', async ({ registerPage }) => {
    // given
    await registerPage.open();

    // when
    await registerPage.submit();

    // then
    await registerPage.expectUrl();
    await registerPage.expectRequiredDetails();
  });

  test('rejects an existing username', async ({ registerPage, existingRegistrationUser }) => {
    // given
    await registerPage.open();
    await registerPage.fillDetails({ ...existingRegistrationUser, email: `other_${existingRegistrationUser.email}` });

    // when
    await registerPage.submit();

    // then
    await registerPage.toast.expectError('Username already exists');
    await registerPage.expectUrl();
  });

  test('opens sign in for an existing account', async ({ registerPage, loginPage }) => {
    // given
    await registerPage.open();

    // when
    await registerPage.goToLogin();

    // then
    await loginPage.expectUrl();
    await loginPage.header.expectVisible();
  });
});
