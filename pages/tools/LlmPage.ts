import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LlmPage extends BasePage {
  protected readonly path = '/llm';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('llm-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText(/^Orchestrate generate, chat, and tool flows/);
  }
}
