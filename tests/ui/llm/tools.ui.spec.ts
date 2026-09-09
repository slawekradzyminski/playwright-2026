import { test, expect } from '../../../fixtures/ui/ollamaUi.fixture';
import { ToolChatPage } from '../../../pages/llm/toolChatPage';
import { OLLAMA_MODEL, beautyScenario } from '../../../fixtures/data/ollamaScenarios';
import { expectToolDefinitions } from '../../../validators/ollamaResponse';

test.describe('LLM tools — deterministic mock', () => {
  let toolChatPage: ToolChatPage;
  test.beforeEach(async ({ page }) => {
    toolChatPage = new ToolChatPage(page);
    await toolChatPage.open();
  });

  test('does not enable sending for whitespace', async ({ page }) => {
    // given
    const submissions: string[] = [];
    page.on('request', request => {
      if (request.url().endsWith('/api/v1/ollama/chat/tools')) submissions.push(request.method());
    });

    // when
    await toolChatPage.input.fill('   ');

    // then
    await expect(toolChatPage.submitButton).toBeDisabled();
    await expect(toolChatPage.userMessages).toHaveCount(0);
    expect(submissions).toEqual([]);
  });

  test('shows tool schemas, the real catalog output and the complete final answer', async ({ beautyProduct }) => {
    // given
    await toolChatPage.settings.configure(OLLAMA_MODEL);
    expectToolDefinitions(await toolChatPage.definitions());

    // when
    const response = await toolChatPage.send(beautyScenario.prompt);

    // then
    expect(response.status()).toBe(200);
    await expect(toolChatPage.userMessages).toHaveText([beautyScenario.prompt]);
    await expect(toolChatPage.toolCalls).toContainText(beautyScenario.tool);
    await expect(toolChatPage.toolOutput).toContainText(beautyProduct.name);
    expect(JSON.parse(await toolChatPage.toolOutput.innerText()).products)
      .toContainEqual({ id: beautyProduct.id, name: beautyProduct.name });
    await expect(toolChatPage.assistantMessages).toHaveText([beautyScenario.answer]);
    await expect(toolChatPage.thinking).toHaveCount(0);
  });

  test('retries a simulated service failure and finishes a live tool response', async ({ page }) => {
    // given
    await toolChatPage.settings.configure(OLLAMA_MODEL);
    await page.route('**/api/v1/ollama/chat/tools', route => route.fulfill({
      status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Ollama temporarily unavailable' })
    }), { times: 1 });
    await toolChatPage.send(beautyScenario.prompt);
    await expect(page.getByText('Failed to fetch stream: Service Unavailable', { exact: true })).toBeVisible();

    // when
    const response = await toolChatPage.send(beautyScenario.prompt);

    // then
    expect(response.status()).toBe(200);
    await expect(toolChatPage.toolCalls).toContainText(beautyScenario.tool);
    await expect(toolChatPage.toolOutput).toHaveCount(1);
    await expect(toolChatPage.assistantMessages).toHaveText([beautyScenario.answer]);
  });
});
