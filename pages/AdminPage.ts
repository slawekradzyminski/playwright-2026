import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  protected readonly path = '/admin';
  readonly dashboard: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboard = page.getByTestId('admin-dashboard');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.dashboard).toBeVisible();
  }
}
