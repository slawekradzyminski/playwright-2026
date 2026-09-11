import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class LlmPage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/llm', 'llm-page');
    this.header = new AuthenticatedHeader(page);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
}
