import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class HomePage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/', 'home-page');
    this.header = new AuthenticatedHeader(page);
  }

  async reload() {
    await this.page.reload();
  }

  async expectWelcome(user: { firstName: string; email: string }) {
    await expect(this.root.getByTestId('home-welcome-title')).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(this.root.getByTestId('home-user-email')).toHaveText(user.email);
  }

  async goToProducts() {
    await this.root.getByTestId('home-products-button').click();
  }

  async goToProfile() {
    await this.root.getByTestId('home-profile-button').click();
  }

  async goToUsers() {
    await this.root.getByTestId('home-users-button').click();
  }

  async goToLlm() {
    await this.root.getByTestId('home-llm-button').click();
  }

  async goToTrafficMonitor() {
    await this.root.getByTestId('home-traffic-button').click();
  }

  async goToQrCode() {
    await this.root.getByTestId('home-qr-button').click();
  }

  async goToEmail() {
    await this.root.getByTestId('home-email-button').click();
  }

  async expectAuthenticated() {
    await expect(this.root.getByTestId('home-welcome-title')).toHaveText(/^Welcome, .+!$/);
    await this.header.expectVisible();
  }
}
