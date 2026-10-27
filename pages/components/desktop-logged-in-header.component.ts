import type { Locator, Page } from '@playwright/test';

export class DesktopLoggedInHeader {
  readonly root: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;
  readonly adminLink: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
    this.profileLink = this.root.getByTestId('username-profile-link');
    this.logoutButton = this.root.getByTestId('logout-button');
    this.adminLink = this.root.getByTestId('desktop-menu-admin');
  }

  async openHome() { await this.root.getByTestId('brand-link').click(); }
  async openProducts() { await this.root.getByTestId('desktop-menu-products').click(); }
  async openEmail() { await this.root.getByTestId('desktop-menu-send-email').click(); }
  async openQr() { await this.root.getByTestId('desktop-menu-qr-code').click(); }
  async openLlm() { await this.root.getByTestId('desktop-menu-llm').click(); }
  async openTraffic() { await this.root.getByTestId('desktop-menu-traffic-monitor').click(); }
  async openCart() { await this.root.getByTestId('desktop-cart-icon').click(); }
  async openProfile() { await this.profileLink.click(); }
  async logout() { await this.logoutButton.click(); }
  async openAdmin() { await this.adminLink.click(); }
}
