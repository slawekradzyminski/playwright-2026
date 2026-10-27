import { expectIncrementalCompletedStream, expectMotivationalQuote, expectReleasePlanWithThinking } from './ollama-assertions';
import { expectContentType } from '../support/content-type';
import { test, expect } from '../fixtures';
import { OllamaClient, parseOllamaEvents } from '../../../http/ollama-client';

const model = 'qwen3.5:2b';

test.describe('POST /api/v1/ollama/generate', () => {
  test('streams a deterministic mock response and completion - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).generate({ model, prompt: 'Provide a motivational quote' });
    // then
    expect(response.status()).toBe(200);
    expectContentType(response, 'text/event-stream');
    const events = parseOllamaEvents(await response.text());
    expectMotivationalQuote(events, model);
  });

  test('delivers an event before the stream finishes - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    // when
    try {
      const response = await new OllamaClient(request, token).generateStream(
        { model, prompt: 'Provide a motivational quote' }, controller.signal,
      );
      // then
      expect(response.status).toBe(200);
      expectContentType(response, 'text/event-stream');
      await expectIncrementalCompletedStream(response);
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }
  });

  test('includes thinking when requested - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).generate({ model, prompt: 'Summarize the release plan', think: true });
    // then
    expect(response.status()).toBe(200);
    const events = parseOllamaEvents(await response.text());
    expectReleasePlanWithThinking(events);
  });

  test('rejects blank model and prompt - 400', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).generate({ model: '', prompt: '' });
    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ model: 'must not be blank', prompt: 'must not be blank' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OllamaClient(request).generate({ model, prompt: 'Provide a motivational quote' });
    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
