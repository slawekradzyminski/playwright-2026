import { expect, type Locator, type Page } from '@playwright/test';

export class AuthenticatedHeader {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
  }

  async expectVisible() {
    const profile = this.root.getByTestId('username-profile-link');
    await expect(profile).toBeVisible();
    await expect(profile).toHaveAttribute('href', '/profile');
    await expect(profile).not.toBeEmpty();
    await expect(this.root.getByTestId('logout-button')).toBeVisible();
    await expect(this.root.getByTestId('login-link')).toBeHidden();
  }

  async logout() {
    await this.root.getByTestId('logout-button').click();
  }
}
