import type { Locator, Page } from '@playwright/test';

export class MobileLoggedInHeader {
  readonly menu: Locator;
  readonly menuToggle: Locator;
  readonly adminLink: Locator;

  constructor(page: Page) {
    const navigation = page.getByTestId('navigation');
    this.menu = navigation.getByTestId('mobile-menu');
    this.menuToggle = navigation.getByTestId('mobile-menu-toggle');
    this.adminLink = this.menu.getByTestId('mobile-menu-admin');
  }

  async toggleMenu() { await this.menuToggle.click(); }
  async openProducts() { await this.menu.getByTestId('mobile-menu-products').click(); }
  async logout() { await this.menu.getByTestId('mobile-menu-logout').click(); }
  async openAdmin() { await this.adminLink.click(); }
}
