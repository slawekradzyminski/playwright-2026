import { expectCatalogToolDefinitions } from './ollama-assertions';
import { expectContentType } from '../support/content-type';
import { test, expect } from '../fixtures';
import { OllamaClient } from '../../../http/ollama-client';

test.describe('GET /api/v1/ollama/chat/tools/definitions', () => {
  test('returns the supported tool schemas - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    // when
    const response = await new OllamaClient(request, token).definitions();
    // then
    expect(response.status()).toBe(200);
    expectContentType(response, 'application/json');
    expectCatalogToolDefinitions(await response.json());
  });

  test('requires authentication - 401', async ({ request }) => {
    // when
    const response = await new OllamaClient(request).definitions();
    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
