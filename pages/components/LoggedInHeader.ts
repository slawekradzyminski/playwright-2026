import { expect, type Locator, type Page } from '@playwright/test';

export class LoggedInHeader {
  readonly root: Locator;
  readonly brandLink: Locator;
  readonly productsLink: Locator;
  readonly sendEmailLink: Locator;
  readonly qrCodeLink: Locator;
  readonly llmLink: Locator;
  readonly trafficMonitorLink: Locator;
  readonly adminLink: Locator;
  readonly cartLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
    this.brandLink = this.root.getByTestId('brand-link');
    this.productsLink = this.root.getByTestId('desktop-menu-products');
    this.sendEmailLink = this.root.getByTestId('desktop-menu-send-email');
    this.qrCodeLink = this.root.getByTestId('desktop-menu-qr-code');
    this.llmLink = this.root.getByTestId('desktop-menu-llm');
    this.trafficMonitorLink = this.root.getByTestId('desktop-menu-traffic-monitor');
    this.adminLink = this.root.getByTestId('desktop-menu-admin');
    this.cartLink = this.root.getByTestId('desktop-cart-icon');
    this.profileLink = this.root.getByTestId('username-profile-link');
    this.logoutButton = this.root.getByTestId('logout-button');
  }

  /** Menu links every logged in user sees, regardless of role. */
  async expectCommonMenuLinks() {
    await expect(this.productsLink).toHaveText('Products');
    await expect(this.sendEmailLink).toHaveText('Send Email');
    await expect(this.qrCodeLink).toHaveText('QR Code');
    await expect(this.llmLink).toHaveText('LLM');
    await expect(this.trafficMonitorLink).toHaveText('Traffic Monitor');
    await expect(this.cartLink).toBeVisible();
    await expect(this.logoutButton).toHaveText('Logout');
  }

  async clickLogout() {
    await this.logoutButton.click();
  }
}
