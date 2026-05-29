import { expect, test } from '../../../fixtures/auth.fixture';
import { LlmChatPage } from '../../../pages/LlmChatPage';
import { LlmGeneratePage } from '../../../pages/LlmGeneratePage';
import { LlmPage } from '../../../pages/LlmPage';
import { LlmToolsPage } from '../../../pages/LlmToolsPage';

test.describe('LLM overview UI tests', () => {
  test('should route users to each LLM workflow from the overview', async ({ page }) => {
    // given
    const llmPage = new LlmPage(page);
    const generatePage = new LlmGeneratePage(page);
    const chatPage = new LlmChatPage(page);
    const toolsPage = new LlmToolsPage(page);
    await llmPage.goto();
    await llmPage.verifyLoaded();

    // when
    await llmPage.openGenerate();

    // then
    await generatePage.verifyLoaded();

    // given
    await llmPage.goto();

    // when
    await llmPage.openChat();

    // then
    await chatPage.verifyLoaded();

    // given
    await llmPage.goto();

    // when
    await llmPage.openTools();

    // then
    await toolsPage.verifyLoaded();
  });

  test('should return from each LLM workflow to the overview', async ({ page }) => {
    // given
    const llmPage = new LlmPage(page);
    const modes = [
      new LlmGeneratePage(page),
      new LlmChatPage(page),
      new LlmToolsPage(page)
    ];

    for (const modePage of modes) {
      // given
      await modePage.goto();
      await modePage.verifyLoaded();

      // when
      await modePage.backLink.click();

      // then
      await expect(page).toHaveURL(llmPage.url);
      await llmPage.verifyLoaded();
    }
  });
});
