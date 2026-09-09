import { test, expect } from '../../../fixtures/loggedInUser.fixture';
import { OllamaClient } from '../../../http/ollamaClient';
import { OLLAMA_MODEL, releaseScenario } from '../../../fixtures/data/ollamaScenarios';
import { assistantText, expectOllamaError, expectOllamaStream, thinkingText } from '../../../validators/ollamaResponse';

test.describe('POST /api/v1/ollama/generate — deterministic mock', () => {
  let client: OllamaClient;
  test.beforeEach(({ request }) => { client = new OllamaClient(request); });

  for (const think of [false, true]) {
    test(`200: streams the complete answer with thinking ${think ? 'on' : 'off'}`, async ({ loggedInUser }) => {
      // given
      const payload = { model: OLLAMA_MODEL, prompt: releaseScenario.prompt, think };

      // when
      const response = await client.generate(payload, loggedInUser.token);

      // then
      const chunks = await expectOllamaStream(response, OLLAMA_MODEL);
      expect(assistantText(chunks)).toBe(releaseScenario.answer);
      expect(thinkingText(chunks)).toBe(think ? releaseScenario.thinking : '');
      expect(chunks.filter(chunk => chunk.done)).toHaveLength(1);
    });
  }

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  test('400: rejects a blank prompt with a field error', async ({ loggedInUser }) => {
    // given
    const payload = { model: OLLAMA_MODEL, prompt: ' ' };

    // when
    const response = await client.generate(payload, loggedInUser.token);

    // then
    await expectOllamaError(response, 400, { prompt: 'must not be blank' });
  });

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  for (const [identity, token, message] of [
    ['anonymous', undefined, 'Unauthorized'], ['invalid bearer', 'invalid', 'Invalid or expired token']
  ] as const) {
    test(`401: rejects ${identity}`, async () => {
      // given
      const payload = { model: OLLAMA_MODEL, prompt: releaseScenario.prompt };

      // when
      const response = await client.generate(payload, token);

      // then
      await expectOllamaError(response, 401, { message });
    });
  }
});
