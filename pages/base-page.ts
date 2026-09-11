import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';

export abstract class BasePage {
  protected readonly root: Locator;

  protected constructor(
    protected readonly page: Page,
    private readonly path: string,
    testId: string,
  ) {
    this.root = page.getByTestId(testId);
  }

  async open() {
    await this.page.goto(`${APP_BASE_URL}${this.path}`);
  }

  async expectUrl() {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}${this.path}`);
  }

}
