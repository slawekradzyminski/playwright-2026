import { expect, type Locator, type Page } from '@playwright/test';

export class LoggedOutHeader {
  readonly root: Locator;
  readonly brandLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
    this.brandLink = this.root.getByTestId('brand-link');
    this.loginLink = this.root.getByTestId('login-link');
    this.registerLink = this.root.getByTestId('register-link');
  }

  async expectToBeVisible() {
    await expect(this.loginLink).toHaveText('Login');
    await expect(this.registerLink).toHaveText('Register');
    await expect(this.root.getByTestId('logout-button')).toBeHidden();
  }

  async clickLogin() {
    await this.loginLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }
}
