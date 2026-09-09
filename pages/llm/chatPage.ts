import { expect, type Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { LlmSettings } from './llmSettings';

export class ChatPage extends BasePage {
  readonly input;
  readonly submitButton;
  readonly userMessages;
  readonly assistantMessages;
  readonly thinking;
  readonly settings;

  constructor(page: Page, private readonly mode: 'chat' | 'tools' = 'chat') {
    super(page);
    this.input = page.getByTestId('chat-input');
    this.submitButton = page.getByTestId('chat-send-button');
    this.userMessages = page.getByTestId('chat-message-content-user');
    this.assistantMessages = page.getByTestId('chat-message-content-assistant');
    this.thinking = page.getByTestId('thinking-content');
    this.settings = new LlmSettings(page, mode === 'tools' ? 'tool' : 'chat');
  }

  async open() {
    await this.page.goto(`/llm/${this.mode}`);
    await expect(this.page.getByTestId(this.mode === 'tools' ? 'ollama-tool-chat-page' : 'ollama-chat-page')).toBeVisible();
    await expect(this.input).toBeEnabled();
  }

  async send(message: string) {
    await this.input.fill(message);
    const endpoint = this.mode === 'tools' ? 'chat/tools' : 'chat';
    const response = this.page.waitForResponse(response =>
      response.url().endsWith(`/api/v1/ollama/${endpoint}`) && response.request().method() === 'POST');
    await this.input.press('Enter');
    return response;
  }

  async showThinking() {
    await this.page.getByTestId('thinking-toggle').locator('summary').press('Enter');
    await expect(this.thinking).toBeVisible();
  }
}
