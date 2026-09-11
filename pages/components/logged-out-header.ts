import { expect, type Locator, type Page } from '@playwright/test';

export class LoggedOutHeader {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
  }

  async goToRegister() {
    await this.root.getByTestId('register-link').click();
  }

  async goToLogin() {
    await this.root.getByTestId('login-link').click();
  }

  async goHome() {
    await this.root.getByTestId('brand-link').click();
  }

  async expectSessionCleared() {
    await expect.poll(() => this.root.page().evaluate(() => ({
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
    }))).toEqual({ token: null, refreshToken: null });
  }

  async expectVisible() {
    await expect(this.root.getByTestId('login-link')).toBeVisible();
    await expect(this.root.getByTestId('register-link')).toBeVisible();
    await expect(this.root.getByTestId('logout-button')).toBeHidden();
    await expect(this.root.getByTestId('username-profile-link')).toBeHidden();
  }
}
