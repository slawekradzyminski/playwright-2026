import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';

test.describe('Registration accessibility scan', () => {
  test('has no automatically detectable WCAG A or AA violations on the initial page', async ({ page }) => {
    // given
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await expect(registerPage.usernameInput).toBeVisible();

    // when
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // then
    expect(results.violations).toEqual([]);
  });

  test('has no automatically detectable WCAG A or AA violations after validation', async ({ page }) => {
    // given
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.submitButton.click();
    await expect(registerPage.lastNameError).toBeVisible();

    // when
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // then
    expect(results.violations).toEqual([]);
  });
});
