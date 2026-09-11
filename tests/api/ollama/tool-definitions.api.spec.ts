import { test } from '../../../fixtures/shared/account';
import { ToolDefinitionsClient } from '../../../clients/ollama/tool-definitions-client';
import { expectCatalogToolDefinitions, expectToolDefinitionsUnauthorized } from '../../../validators/ollama-definitions-validator';
import { unauthorizedCases } from '../test-data/unauthorized-cases';

test.describe('GET /api/v1/ollama/chat/tools/definitions', () => {
  let client: ToolDefinitionsClient;
  test.beforeEach(({ request }) => {
    // given
    client = new ToolDefinitionsClient(request);
  });

  test('should describe both supported catalog functions and their arguments - 200', async ({ account }) => {
    // given
    const token = account.token;

    // when
    const response = await client.get(token);

    // then
    await expectCatalogToolDefinitions(response);
  });

  test('should reject unauthorized access to tool definitions - 401', async ({ account }) => {
    // given
    for (const { name, token, message } of unauthorizedCases(account.token)) {
      await test.step(name, async () => {
        // when
        const response = await client.get(token);

        // then
        await expectToolDefinitionsUnauthorized(response, message);
      });
    }
  });
});
