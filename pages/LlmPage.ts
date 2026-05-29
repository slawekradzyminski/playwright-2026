import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class LlmPage {
  readonly page: Page;
  readonly llmPage: Locator;
  readonly title: Locator;
  readonly modeGrid: Locator;
  readonly generateCard: Locator;
  readonly chatCard: Locator;
  readonly toolsCard: Locator;
  readonly llmUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.llmPage = page.getByTestId('llm-page');
    this.title = page.getByTestId('llm-title');
    this.modeGrid = page.getByTestId('llm-mode-grid');
    this.generateCard = page.getByTestId('llm-mode-card-generate');
    this.chatCard = page.getByTestId('llm-mode-card-chat');
    this.toolsCard = page.getByTestId('llm-mode-card-tools');
    this.llmUrl = `${APP_BASE_URL}/llm`;
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(this.llmUrl);
    await expect(this.llmPage).toBeVisible();
    await expect(this.title).toHaveText('Orchestrate generate, chat, and tool flows in one cockpit');
    await expect(this.modeGrid).toBeVisible();
    await expect(this.generateCard).toBeVisible();
    await expect(this.chatCard).toBeVisible();
    await expect(this.toolsCard).toBeVisible();
  }
}
