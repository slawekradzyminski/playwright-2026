import { test } from '../../../fixtures/auth.fixture';
import { LlmChatPage } from '../../../pages/LlmChatPage';

test.describe('LLM chat UI tests', () => {
  test('should append deterministic user and assistant messages to the chat transcript', async ({ page }) => {
    // given
    const chatPage = new LlmChatPage(page);
    const message = 'Give me a quick status update on the Ollama mock';
    const response = 'The Ollama mock is up on port 11434';
    await chatPage.goto();
    await chatPage.verifyLoaded();

    // when
    await chatPage.sendMessage(message);

    // then
    await chatPage.verifyTranscriptContains(message, response);
  });
});
