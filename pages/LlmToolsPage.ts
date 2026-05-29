import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LlmToolsPage extends BasePage {
  readonly pageRoot: Locator;
  readonly backLink: Locator;
  readonly settingsPanel: Locator;
  readonly toolDefinitionJson: Locator;
  readonly systemPrompt: Locator;
  readonly modelInput: Locator;
  readonly temperatureSlider: Locator;
  readonly thinkingCheckbox: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    super(page, '/llm/tools');
    this.pageRoot = this.byTestId('llm-tools-mode');
    this.backLink = this.byTestId('llm-back-link');
    this.settingsPanel = this.byTestId('tool-settings-panel');
    this.toolDefinitionJson = this.byTestId('tool-definition-json');
    this.systemPrompt = this.byTestId('tool-system-prompt');
    this.modelInput = this.byTestId('model-input');
    this.temperatureSlider = this.byTestId('temperature-slider');
    this.thinkingCheckbox = this.byTestId('thinking-checkbox');
    this.chatInput = this.byTestId('chat-input');
    this.sendButton = this.byTestId('chat-send-button');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.pageRoot.getByRole('heading', { name: 'Catalog-grounded assistant' })).toBeVisible();
    await expect(this.backLink).toBeVisible();
    await expect(this.settingsPanel).toBeVisible();
    await expect(this.systemPrompt).toBeVisible();
    await expect(this.toolDefinitionJson).toContainText('get_product_snapshot');
    await expect(this.toolDefinitionJson).toContainText('list_products');
    await expect(this.modelInput).toHaveValue('qwen3.5:2b');
    await expect(this.temperatureSlider).toHaveValue('0.4');
    await expect(this.thinkingCheckbox).not.toBeChecked();
    await expect(this.chatInput).toBeVisible();
  }

  async verifyEmptyQuestionCannotSubmit() {
    await expect(this.chatInput).toHaveValue('');
    await expect(this.sendButton).toBeDisabled();
  }

  async enterQuestion(question: string) {
    await this.chatInput.fill(question);
  }

  async verifyQuestionCanSubmit() {
    await expect(this.sendButton).toBeEnabled();
  }

  async askQuestion(question: string) {
    await this.enterQuestion(question);
    await this.sendButton.click();
  }

  async verifyToolResponseContains(expectedTexts: string[]) {
    for (const expectedText of expectedTexts) {
      await expect(this.pageRoot).toContainText(expectedText, { timeout: 10_000 });
    }
  }
}
