import { test, expect } from '@playwright/test';

test('redirects an anonymous product detail visit to sign in', async ({ page }) => {
  // given
  // when
  await page.goto('/products/1');

  // then
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});
