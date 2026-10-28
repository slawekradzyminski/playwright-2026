import { test, expect } from '@playwright/test';

test('redirects an anonymous visitor from the cart to sign in', async ({ page }) => {
  // given
  // when
  await page.goto('/cart');

  // then
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
});
