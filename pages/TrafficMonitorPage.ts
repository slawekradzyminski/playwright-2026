import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class TrafficMonitorPage {
  readonly page: Page;
  readonly trafficMonitorPage: Locator;
  readonly title: Locator;
  readonly connectionStatus: Locator;
  readonly statusContainer: Locator;
  readonly eventsTitle: Locator;
  readonly clearButton: Locator;
  readonly trafficMonitorUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.trafficMonitorPage = page.getByTestId('traffic-monitor-page');
    this.title = page.getByTestId('traffic-title');
    this.connectionStatus = page.getByTestId('traffic-connection-status');
    this.statusContainer = page.getByTestId('traffic-status-container');
    this.eventsTitle = page.getByTestId('traffic-events-title');
    this.clearButton = page.getByTestId('traffic-clear-button');
    this.trafficMonitorUrl = `${APP_BASE_URL}/traffic`;
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(this.trafficMonitorUrl);
    await expect(this.trafficMonitorPage).toBeVisible();
    await expect(this.title).toHaveText('Traffic Monitor');
    await expect(this.connectionStatus).toBeVisible();
    await expect(this.statusContainer).toBeVisible();
    await expect(this.eventsTitle).toHaveText('Recent Traffic Events');
    await expect(this.clearButton).toBeVisible();
  }
}
