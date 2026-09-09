import { test, expect } from '../../../fixtures/ui/loggedInUi.fixture';
import { ChatPage } from '../../../pages/llm/chatPage';
import { OLLAMA_MODEL, statusScenario } from '../../../fixtures/data/ollamaScenarios';

test.describe('LLM chat — deterministic mock', () => {
  let chatPage: ChatPage;
  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.open();
  });

  test('does not enable sending for whitespace', async ({ page }) => {
    // given
    const submissions: string[] = [];
    page.on('request', request => {
      if (request.url().endsWith('/api/v1/ollama/chat')) submissions.push(request.method());
    });

    // when
    await chatPage.input.fill('   ');

    // then
    await expect(chatPage.submitButton).toBeDisabled();
    await expect(chatPage.userMessages).toHaveCount(0);
    expect(submissions).toEqual([]);
  });

  for (const think of [false, true]) {
    test(`renders the user and full assistant reply with thinking ${think ? 'on' : 'off'}`, async () => {
      // given
      await chatPage.settings.configure(OLLAMA_MODEL, think);

      // when
      const response = await chatPage.send(statusScenario.prompt);

      // then
      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON()).toMatchObject({
        model: OLLAMA_MODEL, think,
        messages: [expect.objectContaining({ role: 'system' }), { role: 'user', content: statusScenario.prompt }]
      });
      await expect(chatPage.userMessages).toHaveText([statusScenario.prompt]);
      await expect(chatPage.assistantMessages).toHaveText([statusScenario.answer]);
      await expect(chatPage.input).toBeEnabled();
      await expect(chatPage.input).toHaveValue('');
      if (think) {
        await chatPage.showThinking();
        await expect(chatPage.thinking).toHaveText(statusScenario.thinking);
      } else {
        await expect(chatPage.thinking).toHaveCount(0);
      }
    });
  }
});
