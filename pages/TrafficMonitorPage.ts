import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TrafficMonitorPage extends BasePage {
  protected readonly path = '/traffic';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('traffic-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Traffic Monitor');
  }
}
