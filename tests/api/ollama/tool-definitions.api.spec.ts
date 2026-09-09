import { test, expect } from '../../../fixtures/loggedInUser.fixture';
import { OllamaClient } from '../../../http/ollamaClient';
import { expectOllamaError, expectToolDefinitions } from '../../../validators/ollamaResponse';

test.describe('GET /api/v1/ollama/chat/tools/definitions', () => {
  let client: OllamaClient;
  test.beforeEach(({ request }) => { client = new OllamaClient(request); });

  for (const role of ['customer', 'admin'] as const) {
    test(`200: exposes usable catalog tool schemas to ${role}`, async ({ loggedInUser, adminToken }) => {
      // given
      const token = role === 'admin' ? adminToken : loggedInUser.token;

      // when
      const response = await client.getToolDefinitions(token);

      // then
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expectToolDefinitions(await response.json());
    });
  }

  // BUG-048: reports/bugs/[M][D]-BUG-048-ollama-error-response-contract.md
  for (const [identity, token, message] of [
    ['anonymous', undefined, 'Unauthorized'], ['invalid bearer', 'invalid', 'Invalid or expired token']
  ] as const) {
    test(`401: rejects ${identity}`, async () => {
      // given
      // This read has no request body or validation parameters.

      // when
      const response = await client.getToolDefinitions(token);

      // then
      await expectOllamaError(response, 401, { message });
    });
  }
});
