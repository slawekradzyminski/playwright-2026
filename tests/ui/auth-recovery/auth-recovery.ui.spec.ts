import { expect, test } from '../../../fixtures/ui.fixture';
import { createRegisterUser } from '../../../generators/userGenerator';
import { RegisterClient } from '../../../http-clients/RegisterClient';
import { ForgotPasswordPage } from '../../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../../pages/ResetPasswordPage';

test.describe('Auth recovery UI tests', () => {
  test('should load forgot password page', async ({ page }) => {
    // given
    const forgotPasswordPage = new ForgotPasswordPage(page);

    // when
    await forgotPasswordPage.goto();

    // then
    await forgotPasswordPage.verifyLoaded();
  });

  test('should show forgot password validation for empty identifier', async ({ page }) => {
    // given
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();

    // when
    await forgotPasswordPage.submit();

    // then
    await expect(page).toHaveURL(forgotPasswordPage.url);
    await forgotPasswordPage.verifyRequiredIdentifierError();
    await forgotPasswordPage.verifyNoToast();
  });

  test('should request password reset for a registered user', async ({ page, request }) => {
    // given
    const registerClient = new RegisterClient(request);
    const user = createRegisterUser();
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await registerClient.createUser(user);
    await forgotPasswordPage.goto();

    // when
    await forgotPasswordPage.requestReset(user.username);

    // then
    await expect(page).toHaveURL(forgotPasswordPage.url);
    await forgotPasswordPage.verifyResetRequestAccepted();
    await forgotPasswordPage.verifyDeveloperTokenVisible();
  });

  test('should load reset page and prefill token from query string', async ({ page }) => {
    // given
    const resetPasswordPage = new ResetPasswordPage(page);
    const token = 'query-token-123';

    // when
    await resetPasswordPage.gotoWithToken(token);

    // then
    await resetPasswordPage.verifyLoaded();
    await resetPasswordPage.verifyTokenPrefilled(token);
  });

  test('should show reset validation for missing token and passwords', async ({ page }) => {
    // given
    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.goto();

    // when
    await resetPasswordPage.submit();

    // then
    await expect(page).toHaveURL(resetPasswordPage.url);
    await resetPasswordPage.verifyRequiredFieldErrors();
  });

  test('should show reset failure for invalid token', async ({ page }) => {
    // given
    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.goto();

    // when
    await resetPasswordPage.resetPassword('invalid-token', 'Password12345!');

    // then
    await expect(page).toHaveURL(resetPasswordPage.url);
    await resetPasswordPage.verifyInvalidTokenToast();
  });
});
