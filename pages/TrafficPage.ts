import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class TrafficPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('traffic-monitor-page');
    this.title = this.root.getByTestId('traffic-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/traffic');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Traffic Monitor');
    await expect(this.title).toBeVisible();
  }
}
