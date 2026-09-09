import { test, expect } from '../../../fixtures/loggedInUser.fixture';
import { OllamaClient } from '../../../http/ollamaClient';
import { OLLAMA_MODEL, statusScenario } from '../../../fixtures/data/ollamaScenarios';
import { assistantText, expectOllamaError, expectOllamaStream, thinkingText } from '../../../validators/ollamaResponse';

test.describe('POST /api/v1/ollama/chat — deterministic mock', () => {
  let client: OllamaClient;
  test.beforeEach(({ request }) => { client = new OllamaClient(request); });

  for (const think of [false, true]) {
    test(`200: streams the complete assistant answer with thinking ${think ? 'on' : 'off'}`, async ({ loggedInUser }) => {
      // given
      const payload = { model: OLLAMA_MODEL, messages: [{ role: 'user', content: statusScenario.prompt }], think };

      // when
      const response = await client.chat(payload, loggedInUser.token);

      // then
      const chunks = await expectOllamaStream(response, OLLAMA_MODEL);
      expect(assistantText(chunks)).toBe(statusScenario.answer);
      expect(thinkingText(chunks)).toBe(think ? statusScenario.thinking : '');
      expect(chunks.filter(chunk => chunk.done)).toHaveLength(1);
      expect(chunks.filter(chunk => chunk.message).every(chunk => chunk.message?.role === 'assistant')).toBe(true);
    });
  }

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  for (const { name, messages, error } of [
    { name: 'empty history', messages: [], error: { messages: 'At least one message is required' } },
    { name: 'tool output without a tool name', messages: [{ role: 'tool', content: '{}' }],
      error: { 'messages[0].toolNamePresentForToolRole': 'Tool messages must include tool_name' } }
  ]) {
    test(`400: rejects ${name}`, async ({ loggedInUser }) => {
      // given
      const payload = { model: OLLAMA_MODEL, messages };

      // when
      const response = await client.chat(payload, loggedInUser.token);

      // then
      await expectOllamaError(response, 400, error);
    });
  }

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  for (const [identity, token, message] of [
    ['anonymous', undefined, 'Unauthorized'], ['invalid bearer', 'invalid', 'Invalid or expired token']
  ] as const) {
    test(`401: rejects ${identity}`, async () => {
      // given
      const payload = { model: OLLAMA_MODEL, messages: [{ role: 'user', content: statusScenario.prompt }] };

      // when
      const response = await client.chat(payload, token);

      // then
      await expectOllamaError(response, 401, { message });
    });
  }
});
