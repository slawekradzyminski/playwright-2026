import { expect, test } from '../../fixtures/ui.fixture';
import { RegisterClient } from '../../http-clients/RegisterClient';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { createRegisterUser } from '../../generators/userGenerator';

test.describe('Register UI tests', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  test('should register a new user and allow immediate login', async ({ page }) => {
    // given
    const user = createRegisterUser();
    await registerPage.goto();

    // when
    await registerPage.register(user);

    // then
    await expect(page).toHaveURL(loginPage.loginUrl);
    await registerPage.verifySuccessfulRegistrationToast();

    // when
    await loginPage.login({
      username: user.username,
      password: user.password
    });

    // then
    await homePage.verifyLoggedInUser({
      displayName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      email: user.email
    });
  });

  test('should show error for already used username', async ({ page, request }) => {
    // given
    const registerClient = new RegisterClient(request);
    const existingUser = createRegisterUser();
    await registerClient.createUser(existingUser);
    const userWithExistingUsername = {
      ...createRegisterUser(),
      username: existingUser.username
    };
    await registerPage.goto();

    // when
    await registerPage.register(userWithExistingUsername);

    // then
    await expect(page).toHaveURL(registerPage.registerUrl);
    await registerPage.verifyUsernameAlreadyExistsToast();
  });

  test('should show error for already used email', async ({ page, request }) => {
    // given
    const registerClient = new RegisterClient(request);
    const existingUser = createRegisterUser();
    await registerClient.createUser(existingUser);
    const userWithExistingEmail = {
      ...createRegisterUser(),
      email: existingUser.email
    };
    await registerPage.goto();

    // when
    await registerPage.register(userWithExistingEmail);

    // then
    await expect(page).toHaveURL(registerPage.registerUrl);
    await registerPage.verifyErrorToastVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // given
    const signupRequests: string[] = [];
    page.on('request', request => {
      if (RegisterClient.isSignupRequest(request.url())) {
        signupRequests.push(request.url());
      }
    });
    await registerPage.goto();

    // when
    await registerPage.submit();

    // then
    await expect(page).toHaveURL(registerPage.registerUrl);
    await registerPage.verifyRequiredFieldErrors();
    await registerPage.verifyNoToast();
    expect(signupRequests).toHaveLength(0);
  });
});
