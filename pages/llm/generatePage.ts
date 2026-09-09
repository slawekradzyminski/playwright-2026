import { expect, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { LlmSettings } from './llmSettings';

export class GeneratePage extends BasePage {
  readonly input;
  readonly submitButton;
  readonly result;
  readonly thinking;
  readonly settings;

  constructor(page: Page) {
    super(page);
    this.input = page.getByTestId('prompt-input');
    this.submitButton = page.getByTestId('generate-button');
    this.result = page.getByTestId('generated-response');
    this.thinking = page.getByTestId('thinking-content');
    this.settings = new LlmSettings(page, 'generate');
  }

  async open() {
    await this.page.goto('/llm/generate');
    await expect(this.page.getByTestId('ollama-generate-page')).toBeVisible();
    await expect(this.input).toBeEnabled();
  }

  async generate(prompt: string) {
    await this.input.fill(prompt);
    const response = this.page.waitForResponse(response =>
      response.url().endsWith('/api/v1/ollama/generate') && response.request().method() === 'POST');
    await this.input.press('Enter');
    return response;
  }

  async showThinking() {
    await this.page.getByTestId('thinking-result').locator('summary').press('Enter');
    await expect(this.thinking).toBeVisible();
  }
}
