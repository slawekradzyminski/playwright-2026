import { test, expect } from '../../../fixtures/ollama.fixture';
import { OllamaClient } from '../../../http/ollamaClient';
import { OLLAMA_MODEL, beautyScenario } from '../../../fixtures/data/ollamaScenarios';
import { assistantText, expectOllamaError, expectOllamaStream, thinkingText } from '../../../validators/ollamaResponse';

test.describe('POST /api/v1/ollama/chat/tools — deterministic mock', () => {
  let client: OllamaClient;
  test.beforeEach(({ request }) => { client = new OllamaClient(request); });

  test('200: executes the catalog tool before returning the complete assistant answer', async ({ loggedInUser, toolDefinitions, beautyProduct }) => {
    // given
    const payload = { model: OLLAMA_MODEL, messages: [{ role: 'user', content: beautyScenario.prompt }], tools: toolDefinitions };

    // when
    const response = await client.chatWithTools(payload, loggedInUser.token);

    // then
    const chunks = await expectOllamaStream(response, OLLAMA_MODEL);
    const callIndex = chunks.findIndex(chunk => chunk.message?.tool_calls?.length);
    const outputIndex = chunks.findIndex(chunk => chunk.message?.role === 'tool');
    const answerIndex = chunks.findIndex(chunk => chunk.message?.role === 'assistant' && chunk.message.content);
    expect(callIndex).toBeGreaterThanOrEqual(0);
    const calls = chunks[callIndex].message!.tool_calls!;
    expect(calls).toHaveLength(1);
    expect(calls[0].function).toEqual({ name: beautyScenario.tool, arguments: beautyScenario.arguments });
    expect(calls[0].id).toEqual(expect.any(String));
    expect(outputIndex).toBeGreaterThan(callIndex);
    expect(answerIndex).toBeGreaterThan(outputIndex);
    const outputs = chunks.filter(chunk => chunk.message?.role === 'tool');
    expect(outputs).toHaveLength(1);
    expect(outputs[0].message?.tool_name).toBe(beautyScenario.tool);
    const catalog = JSON.parse(outputs[0].message!.content!);
    expect(catalog.products).toContainEqual({ id: beautyProduct.id, name: beautyProduct.name });
    expect(catalog).toMatchObject({ page: 0, size: 25 });
    expect(catalog.total).toBeGreaterThanOrEqual(1);
    expect(assistantText(chunks)).toBe(beautyScenario.answer);
    expect(thinkingText(chunks)).toBe('');
  });

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  for (const invalid of ['empty history', 'empty tools'] as const) {
    test(`400: rejects ${invalid}`, async ({ loggedInUser, toolDefinitions }) => {
      // given
      const payload = {
        model: OLLAMA_MODEL,
        messages: invalid === 'empty history' ? [] : [{ role: 'user', content: beautyScenario.prompt }],
        tools: invalid === 'empty tools' ? [] : toolDefinitions
      };

      // when
      const response = await client.chatWithTools(payload, loggedInUser.token);

      // then
      await expectOllamaError(response, 400, invalid === 'empty history'
        ? { messages: 'At least one message is required' }
        : { error: 'At least one tool definition is required' });
    });
  }

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  for (const [identity, token, message] of [
    ['anonymous', undefined, 'Unauthorized'], ['invalid bearer', 'invalid', 'Invalid or expired token']
  ] as const) {
    test(`401: rejects ${identity}`, async ({ toolDefinitions }) => {
      // given
      const payload = { model: OLLAMA_MODEL, messages: [{ role: 'user', content: beautyScenario.prompt }], tools: toolDefinitions };

      // when
      const response = await client.chatWithTools(payload, token);

      // then
      await expectOllamaError(response, 401, { message });
    });
  }
});
