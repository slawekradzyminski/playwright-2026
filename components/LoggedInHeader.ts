import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class LoggedInHeader {
  readonly page: Page;
  readonly navigation: Locator;
  readonly brandLink: Locator;
  readonly productsLink: Locator;
  readonly emailLink: Locator;
  readonly qrCodeLink: Locator;
  readonly llmLink: Locator;
  readonly trafficMonitorLink: Locator;
  readonly cartLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;

  readonly homeUrl: string;
  readonly productsUrl: string;
  readonly emailUrl: string;
  readonly qrCodeUrl: string;
  readonly llmUrl: string;
  readonly trafficMonitorUrl: string;
  readonly cartUrl: string;
  readonly profileUrl: string;
  readonly loginUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.getByTestId('navigation');
    this.brandLink = page.getByTestId('brand-link');
    this.productsLink = page.getByTestId('desktop-menu-products');
    this.emailLink = page.getByTestId('desktop-menu-send-email');
    this.qrCodeLink = page.getByTestId('desktop-menu-qr-code');
    this.llmLink = page.getByTestId('desktop-menu-llm');
    this.trafficMonitorLink = page.getByTestId('desktop-menu-traffic-monitor');
    this.cartLink = page.getByTestId('desktop-cart-icon');
    this.profileLink = page.getByTestId('username-profile-link');
    this.logoutButton = page.getByTestId('logout-button');

    this.homeUrl = `${APP_BASE_URL}/`;
    this.productsUrl = `${APP_BASE_URL}/products`;
    this.emailUrl = `${APP_BASE_URL}/email`;
    this.qrCodeUrl = `${APP_BASE_URL}/qr`;
    this.llmUrl = `${APP_BASE_URL}/llm`;
    this.trafficMonitorUrl = `${APP_BASE_URL}/traffic`;
    this.cartUrl = `${APP_BASE_URL}/cart`;
    this.profileUrl = `${APP_BASE_URL}/profile`;
    this.loginUrl = `${APP_BASE_URL}/login`;
  }

  async verifyVisible(user: { displayName: string }) {
    await expect(this.navigation).toBeVisible();
    await expect(this.brandLink).toBeVisible();
    await expect(this.productsLink).toBeVisible();
    await expect(this.emailLink).toBeVisible();
    await expect(this.qrCodeLink).toBeVisible();
    await expect(this.llmLink).toBeVisible();
    await expect(this.trafficMonitorLink).toBeVisible();
    await expect(this.cartLink).toBeVisible();
    await expect(this.profileLink).toHaveText(user.displayName);
    await expect(this.logoutButton).toBeVisible();
  }
}
