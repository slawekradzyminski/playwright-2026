import { expect, test } from '../../../fixtures/profile.fixture';
import { totp } from '../../../utils/totp';

test.describe('Profile page UI tests', () => {
  test('should save personal details', async ({ profilePage, profileApi, user }) => {
    // given
    const details = { email: `${user.username}@example.invalid`, firstName: 'Alice', lastName: 'Parker' };
    await profilePage.goto();
    await profilePage.email.fill(details.email);
    await profilePage.firstName.fill(details.firstName);
    await profilePage.lastName.fill(details.lastName);

    // when
    await profilePage.saveDetails.click();

    // then
    await expect.poll(() => profileApi.details()).toMatchObject(details);
    await profilePage.page.reload();
    await expect(profilePage.email).toHaveValue(details.email);
    await expect(profilePage.firstName).toHaveValue(details.firstName);
    await expect(profilePage.lastName).toHaveValue(details.lastName);
  });

  test('should reject an invalid email', async ({ profilePage, profileApi, user }) => {
    // given
    await profilePage.goto();
    await profilePage.email.fill('not-an-email');

    // when
    await profilePage.saveDetails.click();

    // then
    await expect(profilePage.emailError).toHaveText('Invalid email format');
    expect((await profileApi.details()).email).toBe(user.email);
  });

  test('should save the chat system prompt', async ({ profilePage, profileApi }) => {
    // given
    const prompt = 'Respond concisely about this test account.';
    await profilePage.goto();
    await profilePage.prompt.fill(prompt);

    // when
    await profilePage.savePrompt.click();

    // then
    await expect.poll(async () => (await profileApi.chatPrompt()).chatSystemPrompt).toBe(prompt);
    await profilePage.page.reload();
    await expect(profilePage.prompt).toHaveValue(prompt);
  });

  test('should save the tool system prompt', async ({ profilePage, profileApi }) => {
    // given
    const prompt = 'Use tools when answering this test account.';
    await profilePage.goto();
    await profilePage.toolPrompt.fill(prompt);

    // when
    await profilePage.saveToolPrompt.click();

    // then
    await expect.poll(async () => (await profileApi.toolPrompt()).toolSystemPrompt).toBe(prompt);
    await profilePage.page.reload();
    await expect(profilePage.toolPrompt).toHaveValue(prompt);
  });

  test('should enable two-factor authentication', async ({ profilePage, mfaApi }) => {
    // given
    await profilePage.goto();
    const secret = await profilePage.startMfaSetup();
    await profilePage.mfaCode.fill(totp(secret));

    // when
    await profilePage.mfaConfirm.click();

    // then
    await expect(profilePage.mfaStatus).toHaveText('Enabled');
    await expect(profilePage.mfaRecoveryCodes).toBeVisible();
    await expect(profilePage.mfaRecoveryCount).toHaveText('8 unused recovery codes remain.');
    expect(await mfaApi.status()).toEqual({ enabled: true, unusedRecoveryCodes: 8 });
  });

  test.describe('two-factor sign-in', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should sign in with an authenticator code', async ({ loginPage, homePage, mfaApi, user }) => {
      // given
      const { secret, timeStep } = await mfaApi.enable();
      await loginPage.goto();
      await loginPage.login(user);
      // The confirming code's time step is spent; the next one is fresh and within the backend's clock tolerance.
      await loginPage.mfaCode.fill(totp(secret, timeStep + 1));

      // when
      await loginPage.mfaSubmit.click();

      // then
      await homePage.expectToBeOpen();
    });
  });
});
