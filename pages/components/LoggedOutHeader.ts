import type { Locator, Page } from '@playwright/test';

export class LoggedOutHeader {
  readonly root: Locator;
  readonly homeLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
    this.homeLink = this.root.getByTestId('brand-link');
    this.loginLink = this.root.getByTestId('login-link');
    this.registerLink = this.root.getByTestId('register-link');
  }
}
