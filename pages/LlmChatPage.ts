import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LlmChatPage extends BasePage {
  readonly pageRoot: Locator;
  readonly backLink: Locator;
  readonly settingsPanel: Locator;
  readonly systemPrompt: Locator;
  readonly modelInput: Locator;
  readonly temperatureSlider: Locator;
  readonly thinkingCheckbox: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    super(page, '/llm/chat');
    this.pageRoot = this.byTestId('llm-chat-mode');
    this.backLink = this.byTestId('llm-back-link');
    this.settingsPanel = this.byTestId('chat-settings-panel');
    this.systemPrompt = this.byTestId('chat-system-prompt');
    this.modelInput = this.byTestId('model-input');
    this.temperatureSlider = this.byTestId('temperature-slider');
    this.thinkingCheckbox = this.byTestId('thinking-checkbox');
    this.chatInput = this.byTestId('chat-input');
    this.sendButton = this.byTestId('chat-send-button');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.pageRoot.getByRole('heading', { name: 'Conversational assistant' })).toBeVisible();
    await expect(this.backLink).toBeVisible();
    await expect(this.settingsPanel).toBeVisible();
    await expect(this.systemPrompt).toBeVisible();
    await expect(this.modelInput).toHaveValue('qwen3.5:2b');
    await expect(this.temperatureSlider).toHaveValue('0.8');
    await expect(this.thinkingCheckbox).not.toBeChecked();
    await expect(this.chatInput).toBeVisible();
  }

  async verifyEmptyMessageCannotSubmit() {
    await expect(this.chatInput).toHaveValue('');
    await expect(this.sendButton).toBeDisabled();
  }

  async enterMessage(message: string) {
    await this.chatInput.fill(message);
  }

  async verifyMessageCanSubmit() {
    await expect(this.sendButton).toBeEnabled();
  }

  async sendMessage(message: string) {
    await this.enterMessage(message);
    await this.sendButton.click();
  }

  async verifyTranscriptContains(message: string, response: string) {
    await expect(this.pageRoot).toContainText(message);
    await expect(this.pageRoot).toContainText(response, { timeout: 10_000 });
  }
}
