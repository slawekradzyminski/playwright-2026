import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class AdminDashboardPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly metrics: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('admin-dashboard-page');
    this.title = this.root.getByTestId('admin-dashboard-title');
    this.metrics = this.root.getByTestId('admin-dashboard-metrics');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/admin');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Admin Dashboard');
    await expect(this.title).toBeVisible();
    await expect(this.metrics).toBeVisible();
  }
}
