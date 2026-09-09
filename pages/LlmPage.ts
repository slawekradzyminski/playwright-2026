import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class LlmPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('llm-page');
    this.title = this.root.getByTestId('llm-title');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/llm');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Orchestrate generate, chat, and tool flows in one cockpit');
    await expect(this.title).toBeVisible();
  }
}
