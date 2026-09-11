import { expect, type Locator, type Page } from '@playwright/test';

export class LoggedOutHeader {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
  }

  async goToRegister() {
    await this.root.getByTestId('register-link').click();
  }

  async expectVisible() {
    await expect(this.root.getByTestId('login-link')).toBeVisible();
    await expect(this.root.getByTestId('register-link')).toBeVisible();
    await expect(this.root.getByTestId('logout-button')).toBeHidden();
  }
}
