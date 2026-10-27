import { expectMockStatusUpdate } from './ollama-assertions';
import { expectContentType } from '../support/content-type';
import { test, expect } from '../fixtures';
import { OllamaClient, parseOllamaEvents } from '../../../http/ollama-client';

const model = 'qwen3.5:2b';
const messages = [{ role: 'user', content: 'Give me a quick status update on the Ollama mock' }];

test.describe('POST /api/v1/ollama/chat', () => {
  test('streams the mock chat response - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).chat({ model, messages });
    // then
    expect(response.status()).toBe(200);
    expectContentType(response, 'text/event-stream');
    const events = parseOllamaEvents(await response.text());
    expectMockStatusUpdate(events, model);
  });

  test('requires at least one message - 400', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).chat({ model, messages: [] });
    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ messages: 'At least one message is required' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OllamaClient(request).chat({ model, messages });
    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
