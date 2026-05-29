import { test } from '../../../fixtures/auth.fixture';
import { LlmGeneratePage } from '../../../pages/LlmGeneratePage';

test.describe('LLM generate UI tests', () => {
  test('should render deterministic generated content from the mock', async ({ page }) => {
    // given
    const generatePage = new LlmGeneratePage(page);
    const prompt = 'Summarize the release plan';
    const expectedResponse = 'Release plan: qwen3.5:2b is the default mock model';
    await generatePage.goto();
    await generatePage.verifyLoaded();

    // when
    await generatePage.generate(prompt);

    // then
    await generatePage.verifyGeneratedResponse(expectedResponse);
  });

  test('should explain supported prompts when the generate mock receives an unsupported prompt', async ({ page }) => {
    // given
    const generatePage = new LlmGeneratePage(page);
    await generatePage.goto();
    await generatePage.verifyLoaded();

    // when
    await generatePage.generate('Say deterministic hello');

    // then
    await generatePage.verifyGeneratedResponse('Sorry, only these prompts are supported for this endpoint');
    await generatePage.verifyGeneratedResponse('Walk me through the streaming demo for /api/generate');
  });
});
