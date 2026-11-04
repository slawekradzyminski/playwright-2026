import { generateUser } from '../../generators/userGenerator';
import { expect, test } from '../../fixtures/pages.fixture';

test.describe('Registration UI tests', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test('should create an account that can sign in', async ({ registerPage, loginPage, homePage }) => {
    // given
    const user = generateUser();

    // when
    await registerPage.register(user);

    // then
    await loginPage.expectToBeOpen();
    await loginPage.toast.expectToast('Success', 'Registration successful! You can now log in.');

    // when
    await loginPage.login(user);

    // then
    await homePage.expectToBeOpen();
    await expect(homePage.profileLink).toHaveText(`${user.firstName} ${user.lastName}`);
  });

  test('should require all registration fields', async ({ registerPage }) => {
    // when
    await registerPage.submitButton.click();

    // then
    await expect(registerPage.usernameError).toHaveText('Username is required');
    await expect(registerPage.emailError).toHaveText('Email is required');
    await expect(registerPage.passwordError).toHaveText('Password is required');
    await expect(registerPage.firstNameError).toHaveText('First name is required');
    await expect(registerPage.lastNameError).toHaveText('Last name is required');
    await registerPage.expectToBeOpen();
  });

  test('should reject invalid email and short registration fields', async ({ registerPage }) => {
    // given
    const user = {
      ...generateUser(),
      username: 'abc',
      email: 'not-an-email',
      password: 'short',
      firstName: 'Ada',
    };

    // when
    await registerPage.register(user);

    // then
    await expect(registerPage.usernameError).toHaveText('Username must be at least 4 characters');
    await expect(registerPage.emailError).toHaveText('Invalid email format');
    await expect(registerPage.passwordError).toHaveText('Password must be at least 8 characters');
    await expect(registerPage.firstNameError).toHaveText('First name must be at least 4 characters');
    await expect(registerPage.lastNameError).toBeHidden();
    await registerPage.expectToBeOpen();
  });

  test('should reject a username that is already registered', async ({ registerPage, loginPage }) => {
    // given
    const user = generateUser();
    await registerPage.register(user);
    await loginPage.expectToBeOpen();
    await registerPage.goto();

    // when
    await registerPage.register({ ...generateUser(), username: user.username });

    // then
    await registerPage.toast.expectError('Username already exists');
    await registerPage.expectToBeOpen();
  });

  test('should navigate to login when Sign in is clicked', async ({ registerPage, loginPage }) => {
    // when
    await registerPage.signInButton.click();

    // then
    await loginPage.expectToBeOpen();
  });
});
