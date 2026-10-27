import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly root: Locator;
  readonly welcomeTitle: Locator;
  readonly userEmail: Locator;
  readonly productsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('home-page');
    this.welcomeTitle = this.root.getByTestId('home-welcome-title');
    this.userEmail = this.root.getByTestId('home-user-email');
    this.productsButton = this.root.getByTestId('home-products-button');
  }

  async goto() { await this.page.goto(this.path); }
  async reload() { await this.page.reload(); }
  async openProducts() { await this.productsButton.click(); }
  async openUsers() { await this.root.getByTestId('home-users-button').click(); }
  async openProfile() { await this.root.getByTestId('home-profile-button').click(); }
  async openLlm() { await this.root.getByTestId('home-llm-button').click(); }
  async openTraffic() { await this.root.getByTestId('home-traffic-button').click(); }
  async openQr() { await this.root.getByTestId('home-qr-button').click(); }
  async openEmail() { await this.root.getByTestId('home-email-button').click(); }
}
