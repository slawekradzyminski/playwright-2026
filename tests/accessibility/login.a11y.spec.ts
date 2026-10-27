import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login accessibility scan', () => {
  test('has no automatically detectable WCAG A or AA violations on the initial page', async ({ page }) => {
    // given
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.usernameInput).toBeVisible();

    // when
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // then
    expect(results.violations).toEqual([]);
  });

  test('has no automatically detectable WCAG A or AA violations after validation', async ({ page }) => {
    // given
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.usernameError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();

    // when
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // then
    expect(results.violations).toEqual([]);
  });
});
