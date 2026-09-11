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

  async expectUser(firstName: string, lastName: string) {
    await expect(this.root.getByTestId('username-profile-link')).toHaveText(`${firstName} ${lastName}`);
  }

  async expectCartCount(quantity: number) {
    const cart = this.root.getByTestId('desktop-cart-icon');
    await expect(cart).toBeVisible();
    const count = cart.getByTestId('cart-item-count');
    if (quantity === 0) {
      await expect(count).toHaveCount(0);
    } else {
      await expect(count).toHaveText(String(quantity));
    }
  }

  async goToProducts() {
    await this.root.getByTestId('desktop-menu-products').click();
  }

  async goToSendEmail() {
    await this.root.getByTestId('desktop-menu-send-email').click();
  }

  async goToQrCode() {
    await this.root.getByTestId('desktop-menu-qr-code').click();
  }

  async goToLlm() {
    await this.root.getByTestId('desktop-menu-llm').click();
  }

  async goToTrafficMonitor() {
    await this.root.getByTestId('desktop-menu-traffic-monitor').click();
  }

  async goToAdmin() {
    await this.root.getByTestId('desktop-menu-admin').click();
  }

  async expectAdminLinkVisible() {
    await expect(this.root.getByTestId('desktop-menu-admin')).toBeVisible();
    await expect(this.root.getByTestId('desktop-menu-admin')).toHaveAttribute('href', '/admin');
  }

  async expectAdminLinkAbsent() {
    // The populated profile and role links render from the same loaded user data.
    await this.expectVisible();
    await expect(this.root.locator('a[href="/admin"]')).toHaveCount(0);
  }

  async goToProfile() {
    await this.root.getByTestId('username-profile-link').click();
  }

  async goToCart() {
    await this.root.getByTestId('desktop-cart-icon').click();
  }

  async goHome() {
    await this.root.getByTestId('brand-link').click();
  }

  async logout() {
    await this.root.getByTestId('logout-button').click();
  }
}
