import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class HomePage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/', 'home-page');
    this.header = new AuthenticatedHeader(page);
  }

  async expectAuthenticated() {
    await expect(this.root.getByTestId('home-welcome-title')).toHaveText(/^Welcome, .+!$/);
    await this.header.expectVisible();
  }
}
