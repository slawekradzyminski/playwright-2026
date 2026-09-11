import { test } from '../../../fixtures/authenticated-user-fixture';
import { GenerateClient } from '../../../clients/ollama/generate-client';
import { expectGeneratedAnswer, expectJsonError } from '../../../validators/ollama-validator';
import { unauthorizedCases } from '../test-data/unauthorized-cases';
import { model, release } from './mock-scenarios';

test.describe('POST /api/v1/ollama/generate', () => {
  let client: GenerateClient;
  test.beforeEach(() => {
    // given
    client = new GenerateClient();
  });

  for (const think of [false, true]) {
    test(`should stream the complete release summary with thinking ${think} - 200`, async ({ authenticatedUser }) => {
      // given
      const payload = { model, prompt: release.prompt, think, options: { temperature: 0 } };

      // when
      const response = await client.generate(payload, authenticatedUser.token);

      // then
      expectGeneratedAnswer(response, { model, text: release.text, thinking: think ? release.thinking : '' });
    });
  }

  test('should preserve Unicode in the assembled quote with thinking omitted - 200', async ({ authenticatedUser }) => {
    // given
    const payload = { model, prompt: 'Provide a motivational quote' };

    // when
    const response = await client.generate(payload, authenticatedUser.token);

    // then
    expectGeneratedAnswer(response, {
      model, text: 'Keep shipping mock services — momentum beats perfection.', thinking: '',
    });
  });

  const invalidCases = [
    { name: 'missing required fields', payload: {}, error: { model: 'must not be blank', prompt: 'must not be blank' } },
    { name: 'blank model', payload: { model: ' ', prompt: release.prompt }, error: { model: 'must not be blank' } },
    { name: 'blank prompt', payload: { model, prompt: ' ' }, error: { prompt: 'must not be blank' } },
  ];
  for (const { name, payload, error } of invalidCases) {
    test(`should reject ${name} before streaming - 400`, async ({ authenticatedUser }) => {
      // given
      const token = authenticatedUser.token;

      // when
      const response = await client.generate(payload, token);

      // then
      expectJsonError(response, 400, error);
    });
  }

  test('should reject unauthorized generation - 401', async ({ authenticatedUser }) => {
    // given
    const payload = { model, prompt: release.prompt };
    for (const { name, token, message } of unauthorizedCases(authenticatedUser.token)) {
      await test.step(name, async () => {
        // when
        const response = await client.generate(payload, token);

        // then
        expectJsonError(response, 401, { message });
      });
    }
  });
});
