import { test, expect } from '../../../fixtures/ui/loggedInUi.fixture';
import { GeneratePage } from '../../../pages/llm/generatePage';
import { OLLAMA_MODEL, quoteScenario, releaseScenario } from '../../../fixtures/data/ollamaScenarios';

test.describe('LLM generate — deterministic mock', () => {
  let generatePage: GeneratePage;
  test.beforeEach(async ({ page }) => {
    generatePage = new GeneratePage(page);
    await generatePage.open();
  });

  test('does not enable generation for whitespace', async ({ page }) => {
    // given
    const submissions: string[] = [];
    page.on('request', request => {
      if (request.url().endsWith('/api/v1/ollama/generate')) submissions.push(request.method());
    });

    // when
    await generatePage.input.fill('   ');

    // then
    await expect(generatePage.submitButton).toBeDisabled();
    await expect(generatePage.result).toHaveCount(0);
    expect(submissions).toEqual([]);
  });

  for (const { think, scenario } of [{ think: false, scenario: quoteScenario }, { think: true, scenario: releaseScenario }]) {
    test(`renders the complete generation with thinking ${think ? 'on' : 'off'}`, async () => {
      // given
      await generatePage.settings.configure(OLLAMA_MODEL, think);

      // when
      const response = await generatePage.generate(scenario.prompt);

      // then
      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON()).toMatchObject({ model: OLLAMA_MODEL, prompt: scenario.prompt, think });
      await expect(generatePage.result).toContainText(scenario.answer);
      await expect(generatePage.input).toBeEnabled();
      await expect(generatePage.input).toHaveValue(scenario.prompt);
      if (think) {
        await generatePage.showThinking();
        await expect(generatePage.thinking).toHaveText(releaseScenario.thinking);
      } else {
        await expect(generatePage.result).toHaveText(quoteScenario.answer);
        await expect(generatePage.thinking).toHaveCount(0);
      }
    });
  }

  test('recovers after a simulated service failure with the prompt retained', async ({ page }) => {
    // given
    await generatePage.settings.configure(OLLAMA_MODEL);
    await page.route('**/api/v1/ollama/generate', route => route.fulfill({
      status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Ollama temporarily unavailable' })
    }), { times: 1 });
    await generatePage.generate(releaseScenario.prompt);
    await expect(page.getByText('Failed to fetch stream: Service Unavailable', { exact: true })).toBeVisible();
    await expect(generatePage.input).toHaveValue(releaseScenario.prompt);

    // when
    const response = await generatePage.generate(releaseScenario.prompt);

    // then
    expect(response.status()).toBe(200);
    await expect(generatePage.result).toHaveText(releaseScenario.answer);
    await expect(generatePage.submitButton).toBeEnabled();
  });
});
