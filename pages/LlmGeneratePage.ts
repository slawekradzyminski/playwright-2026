import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LlmGeneratePage extends BasePage {
  readonly pageRoot: Locator;
  readonly backLink: Locator;
  readonly settingsPanel: Locator;
  readonly modelInput: Locator;
  readonly temperatureSlider: Locator;
  readonly thinkingCheckbox: Locator;
  readonly promptInput: Locator;
  readonly generateButton: Locator;
  readonly generatedResponse: Locator;

  constructor(page: Page) {
    super(page, '/llm/generate');
    this.pageRoot = this.byTestId('llm-generate-mode');
    this.backLink = this.byTestId('llm-back-link');
    this.settingsPanel = this.byTestId('generate-settings-panel');
    this.modelInput = this.byTestId('model-input');
    this.temperatureSlider = this.byTestId('temperature-slider');
    this.thinkingCheckbox = this.byTestId('thinking-checkbox');
    this.promptInput = this.byTestId('prompt-input');
    this.generateButton = this.byTestId('generate-button');
    this.generatedResponse = this.byTestId('generated-response');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.pageRoot.getByRole('heading', { name: 'Single prompt generation' })).toBeVisible();
    await expect(this.backLink).toBeVisible();
    await expect(this.settingsPanel).toBeVisible();
    await expect(this.modelInput).toHaveValue('qwen3.5:2b');
    await expect(this.temperatureSlider).toHaveValue('0.8');
    await expect(this.thinkingCheckbox).not.toBeChecked();
    await expect(this.promptInput).toBeVisible();
  }

  async verifyEmptyPromptCannotSubmit() {
    await expect(this.promptInput).toHaveValue('');
    await expect(this.generateButton).toBeDisabled();
  }

  async enterPrompt(prompt: string) {
    await this.promptInput.fill(prompt);
  }

  async verifyPromptCanSubmit() {
    await expect(this.generateButton).toBeEnabled();
  }

  async generate(prompt: string) {
    await this.enterPrompt(prompt);
    await this.generateButton.click();
  }

  async verifyGeneratedResponse(expectedResponse: string) {
    await expect(this.generatedResponse).toContainText(expectedResponse, { timeout: 10_000 });
  }
}
