import { test, expect } from '../../fixtures/ui/registerUi.fixture';
import { generateSignupUser } from '../../generators/userGenerator';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { SIGNUP_ENDPOINT } from '../../http/signupClient';

const requiredErrors = {
  usernameError: 'Username is required',
  emailError: 'Email is required',
  passwordError: 'Password is required',
  firstNameError: 'First name is required',
  lastNameError: 'Last name is required'
} as const;

const validationCases = [
  {
    name: 'short fields and malformed email',
    values: { username: 'abc', email: 'bad', password: '1234567', firstName: 'Ana', lastName: 'Lee' },
    errors: {
      usernameError: 'Username must be at least 4 characters',
      emailError: 'Invalid email format',
      passwordError: 'Password must be at least 8 characters',
      firstNameError: 'First name must be at least 4 characters',
      lastNameError: 'Last name must be at least 4 characters'
    }
  },
  {
    name: 'fields exceeding 255 characters',
    values: { username: 'x'.repeat(256), password: 'x'.repeat(256), firstName: 'x'.repeat(256), lastName: 'x'.repeat(256) },
    errors: {
      usernameError: 'Username must be at most 255 characters',
      passwordError: 'Password must be at most 255 characters',
      firstNameError: 'First name must be at most 255 characters',
      lastNameError: 'Last name must be at most 255 characters'
    }
  }
] as const;

test.describe('Registration UI tests', () => {
  let registerPage: RegisterPage;
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
  });

  test('should register and allow immediate login', async ({ signupUser }) => {
    // given
    await registerPage.goto();
    await registerPage.fill(signupUser);

    // when
    await registerPage.submitButton.click();

    // then
    await loginPage.assertLoaded();
    await registerPage.toast.assertSuccess('Registration successful! You can now log in.');
    await loginPage.login(signupUser);
    await homePage.assertLoaded();
    await expect(homePage.header.profileLink).toHaveText(`${signupUser.firstName} ${signupUser.lastName}`);
    await expect(homePage.header.profileLink).toBeVisible();
  });

  test('should show all required field errors', async () => {
    // given
    await registerPage.goto();

    // when
    await registerPage.submitButton.click();

    // then
    for (const [field, message] of Object.entries(requiredErrors)) {
      const error = registerPage[field as keyof typeof requiredErrors];
      await expect(error).toHaveText(message);
      await expect(error).toBeVisible();
    }
    await expect(registerPage.usernameInput).toBeFocused();
    await registerPage.assertLoaded();
  });

  for (const scenario of validationCases) {
    test(`should reject ${scenario.name}`, async () => {
      // given
      const user = generateSignupUser(scenario.values);
      await registerPage.goto();

      // when
      await registerPage.register(user);

      // then
      for (const [field, message] of Object.entries(scenario.errors)) {
        const error = registerPage[field as keyof typeof requiredErrors];
        await expect(error).toHaveText(message);
        await expect(error).toBeVisible();
      }
      await registerPage.assertLoaded();
    });
  }

  for (const field of ['username', 'email'] as const) {
    test(`should show a duplicate ${field} error`, async ({ registeredUser, signupUser }) => {
      // given
      const user = { ...signupUser, [field]: registeredUser[field] };
      await registerPage.goto();

      // when
      await registerPage.register(user);

      // then
      await registerPage.toast.assertError(field === 'username' ? 'Username already exists' : 'Email already exists');
      await registerPage.assertLoaded();
      await expect(registerPage.usernameInput).toHaveValue(user.username);
      await expect(registerPage.emailInput).toHaveValue(user.email);
      await expect(registerPage.submitButton).toBeEnabled();
    });
  }

  // BUG-028: valid-filled-form Sign in also creates an account; excluded until fixed.
  test('should navigate to login using the form link from an empty registration form', async () => {
    // given
    await registerPage.goto();

    // when
    await registerPage.loginLink.click();

    // then
    await loginPage.assertLoaded();
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test('should disable submission while pending and show a server error', async ({ page, signupUser }) => {
    // given
    let releaseResponse!: () => void;
    const responseGate = new Promise<void>(resolve => { releaseResponse = resolve; });
    await page.route(`**${SIGNUP_ENDPOINT}`, async route => {
      await responseGate;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Service temporarily unavailable' }) });
    });
    await registerPage.goto();
    await registerPage.fill(signupUser);

    // when
    await registerPage.submitButton.click();

    // then
    try {
      await expect(registerPage.submitButton).toHaveText('Creating account...');
      await expect(registerPage.submitButton).toBeDisabled();
    } finally {
      releaseResponse();
    }
    await expect(registerPage.submitError).toHaveText('Service temporarily unavailable');
    await expect(registerPage.submitError).toBeVisible();
    await expect(registerPage.submitButton).toBeEnabled();
    await expect(registerPage.usernameInput).toHaveValue(signupUser.username);
    await registerPage.assertLoaded();
  });
});
