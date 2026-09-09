import { test, expect } from '../../fixtures/ui/loggedInUi.fixture';
import { ProfilePage } from '../../pages/ProfilePage';

test.describe('Profile UI', () => {
  let profile: ProfilePage;

  test.beforeEach(({ page }) => {
    profile = new ProfilePage(page);
  });

  test('should persist personal information and refresh the header', async ({ loggedInUser, page }) => {
    // given
    await profile.goto();
    await expect(profile.emailInput).toHaveValue(loggedInUser.user.email);
    await profile.firstNameInput.fill('Updated');
    await profile.lastNameInput.fill('Customer');
    const email = `updated.${loggedInUser.user.username}@example.test`;
    await profile.emailInput.fill(email);

    // when
    await profile.saveButton.click();

    // then
    await profile.toast.assertSuccess('User information updated successfully');
    await expect(profile.header.profileLink).toHaveText('Updated Customer');
    await page.reload();
    await expect(profile.emailInput).toHaveValue(email);
    await expect(profile.firstNameInput).toHaveValue('Updated');
    await expect(profile.lastNameInput).toHaveValue('Customer');
  });

  test('should reject malformed email without submitting the form', async ({ page }) => {
    // given
    await profile.goto();
    const writes: string[] = [];
    page.on('request', request => {
      if (request.method() === 'PUT' && request.url().includes('/api/v1/users/')) writes.push(request.url());
    });
    await profile.emailInput.fill('invalid');

    // when
    await profile.saveButton.click();

    // then
    await expect(profile.emailError).toHaveText('Invalid email format');
    await expect(profile.emailInput).toBeFocused();
    expect(writes).toEqual([]);
  });

  for (const kind of ['chat', 'tool'] as const) {
    test(`should persist the ${kind} system prompt`, async ({ page }) => {
      // given
      await profile.goto();
      const input = kind === 'chat' ? profile.chatPromptInput : profile.toolPromptInput;
      const save = kind === 'chat' ? profile.chatPromptSave : profile.toolPromptSave;
      const prompt = `UI regression ${kind}: preserve this instruction.`;
      await input.fill(prompt);

      // when
      await save.click();

      // then
      await profile.toast.assertSuccess(`${kind === 'chat' ? 'Chat' : 'Tool'} system prompt updated successfully`);
      await page.reload();
      await expect(input).toHaveValue(prompt);
    });
  }

  test('should retain input after a simulated save error and allow a live retry', async ({ page, loggedInUser }) => {
    // given
    await profile.goto();
    const endpoint = `**/api/v1/users/${loggedInUser.user.username}`;
    await page.route(endpoint, route => route.fulfill({ status: 503, json: { message: 'Simulated service unavailable' } }));
    await profile.firstNameInput.fill('Recovered');
    await profile.saveButton.click();
    await profile.toast.assertError('Simulated service unavailable');
    await expect(profile.firstNameInput).toHaveValue('Recovered');
    await page.unroute(endpoint);

    // when
    await profile.saveButton.click();

    // then
    await profile.toast.assertSuccess('User information updated successfully');
    await page.reload();
    await expect(profile.firstNameInput).toHaveValue('Recovered');
  });
});
