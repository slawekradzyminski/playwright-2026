import type { Locator, Page } from '@playwright/test';

export class LoggedInHeader {
  readonly root: Locator;
  readonly homeLink: Locator;
  readonly profileLink: Locator;
  readonly cartLink: Locator;
  readonly adminLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('navigation');
    this.homeLink = this.root.getByTestId('brand-link');
    this.profileLink = this.root.getByTestId('username-profile-link');
    this.adminLink = this.root.getByTestId('desktop-menu-admin');
    this.cartLink = this.root.getByTestId('desktop-cart-icon');
    this.logoutButton = this.root.getByTestId('logout-button');
  }

  link(destination: 'products' | 'email' | 'qr' | 'llm' | 'traffic'): Locator {
    const testIds = {
      products: 'desktop-menu-products',
      email: 'desktop-menu-send-email',
      qr: 'desktop-menu-qr-code',
      llm: 'desktop-menu-llm',
      traffic: 'desktop-menu-traffic-monitor'
    };
    return this.root.getByTestId(testIds[destination]);
  }
}
