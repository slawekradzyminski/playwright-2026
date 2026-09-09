import { expect, type Page } from '@playwright/test';
import { ChatPage } from './chatPage';
import type { ToolDefinition } from '../../types/ollama';

export class ToolChatPage extends ChatPage {
  readonly toolCalls;
  readonly toolOutput;

  constructor(page: Page) {
    super(page, 'tools');
    this.toolCalls = page.getByTestId('tool-call-notice');
    this.toolOutput = page.getByTestId('tool-message-content');
  }

  async definitions(): Promise<ToolDefinition[]> {
    await this.settings.open();
    const definitions = this.page.getByTestId('tool-definition-json').locator('pre');
    await expect(definitions).toContainText('list_products');
    const result = JSON.parse(await definitions.innerText()) as ToolDefinition[];
    await this.settings.close();
    return result;
  }
}
