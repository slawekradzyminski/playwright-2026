import { expectBeautyCatalogLookup } from './ollama-assertions';
import { expectContentType } from '../support/content-type';
import { test, expect } from '../fixtures';
import { OllamaClient, parseOllamaEvents } from '../../../http/ollama-client';

const model = 'qwen3.5:2b';
const messages = [{ role: 'user', content: 'What Beauty products do we have available?' }];
const tools = [{ type: 'function', function: { name: 'list_products' } }];

test.describe('POST /api/v1/ollama/chat/tools', () => {
  test('executes a mock-requested tool and continues the stream - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).chatTools({ model, messages, tools });
    // then
    expect(response.status()).toBe(200);
    expectContentType(response, 'text/event-stream');
    const events = parseOllamaEvents(await response.text());
    expectBeautyCatalogLookup(events);
  });

  test('requires tool definitions - 400', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).chatTools({ model, messages });
    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'At least one tool definition is required' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OllamaClient(request).chatTools({ model, messages, tools });
    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
