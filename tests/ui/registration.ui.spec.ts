import { test, expect } from '../api/fixtures';
import { generateUser } from '../../generators/user-generator';
import { LoginPage } from '../../pages/login.page';
import { RegisterPage } from '../../pages/register.page';

test.describe('Registration UI', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('registers a new account and opens login', async ({ page, api }) => {
    // given
    const user = generateUser();
    const loginPage = new LoginPage(page);

    // when
    const response = await registerPage.register(user);
    if (response.status() === 201) api.trackUser(user.username);

    // then
    await loginPage.expectUrl();
    await expect(loginPage.submitButton).toBeVisible();
    await loginPage.toast.expectDescription('Registration successful! You can now log in.');
  });

  test('shows validation errors for empty fields', async () => {
    // given
    // The form starts empty.

    // when
    await registerPage.submitButton.click();

    // then
    await registerPage.expectRequiredErrors();
    await registerPage.expectUrl();
  });

  test('shows a validation error for an invalid email', async () => {
    // given
    await registerPage.emailInput.fill('invalid-email');

    // when
    await registerPage.submitButton.click();

    // then
    await expect(registerPage.emailError).toHaveText('Invalid email format');
    await registerPage.expectUrl();
  });

  test('shows a validation error for a short username', async () => {
    // given
    await registerPage.usernameInput.fill('abc');

    // when
    await registerPage.submitButton.click();

    // then
    await expect(registerPage.usernameError).toHaveText('Username must be at least 4 characters');
    await registerPage.expectUrl();
  });

  test('shows a validation error for a short password', async () => {
    // given
    await registerPage.passwordInput.fill('1234567');

    // when
    await registerPage.submitButton.click();

    // then
    await expect(registerPage.passwordError).toHaveText('Password must be at least 8 characters');
    await registerPage.expectUrl();
  });

  test('shows an error toast for a duplicate username', async ({ api }) => {
    // given
    const existingUser = generateUser();
    expect((await api.registerUser(existingUser)).status()).toBe(201);
    const user = { ...generateUser(), username: existingUser.username };

    // when
    await registerPage.register(user);

    // then
    await registerPage.toast.expectDescription('Username already exists');
    await registerPage.expectUrl();
  });

  test('shows an error toast for a duplicate email', async ({ api }) => {
    // given
    const existingUser = generateUser();
    expect((await api.registerUser(existingUser)).status()).toBe(201);
    const user = { ...generateUser(), email: existingUser.email };

    // when
    await registerPage.register(user);

    // then
    await registerPage.toast.expectDescription('Email already exists');
    await registerPage.expectUrl();
  });

  test('opens login from the registration form', async ({ page }) => {
    // given
    const loginPage = new LoginPage(page);

    // when
    await registerPage.openLogin();

    // then
    await loginPage.expectUrl();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('exposes form labels and supports keyboard navigation', async ({ page }) => {
    // given
    await registerPage.usernameInput.focus();

    // when
    await page.keyboard.press('Tab');

    // then
    await registerPage.expectFormLabels();
    await expect(registerPage.emailInput).toBeFocused();
  });
});
