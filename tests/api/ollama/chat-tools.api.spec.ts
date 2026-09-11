import { expect } from '@playwright/test';
import { test } from '../../../fixtures/authenticated-user-fixture';
import { ChatToolsClient } from '../../../clients/ollama/chat-tools-client';
import { ToolDefinitionsClient } from '../../../clients/ollama/tool-definitions-client';
import { GetProductByIdClient } from '../../../clients/products/get-product-by-id-client';
import type { ToolDefinition } from '../../../types/ollama';
import { expectCompletedStream, expectJsonError, expectNoChatThinking } from '../../../validators/ollama-validator';
import { expectToolCallsInOrder, expectToolResult, expectAssistantAnswerAfterTools } from '../../../validators/ollama-tools-validator';
import { unauthorizedCases } from '../test-data/unauthorized-cases';
import { beauty, iphone, model } from './mock-scenarios';

test.describe('POST /api/v1/ollama/chat/tools', () => {
  let client: ChatToolsClient;
  let definitions: ToolDefinitionsClient;
  let products: GetProductByIdClient;
  test.beforeEach(({ request }) => {
    // given
    client = new ChatToolsClient();
    definitions = new ToolDefinitionsClient(request);
    products = new GetProductByIdClient(request);
  });

  test('should execute a catalog lookup and stream the canned assistant answer - 200', async ({ authenticatedUser }) => {
    // given
    const available = await definitions.get(authenticatedUser.token);
    expect(available.status()).toBe(200);
    const tools: ToolDefinition[] = await available.json();
    const payload = { model, messages: [{ role: 'user', content: beauty.prompt }], tools, think: true };

    // when
    const response = await client.chat(payload, authenticatedUser.token);

    // then
    expectCompletedStream(response, model, 'chat');
    expectToolCallsInOrder(response, [
      { name: 'list_products', arguments: { category: 'beauty', inStockOnly: true, limit: 25 } },
    ]);
    expectToolResult(response, 'list_products', expect.objectContaining({
      page: 0, size: 25, products: expect.any(Array), total: expect.any(Number),
    }));
    expectAssistantAnswerAfterTools(response, beauty.text);
    expectNoChatThinking(response);
  });

  test('should execute two tools in order and return the real backend snapshot - 200', async ({ authenticatedUser }) => {
    // given: the fixed mock scenario requests seeded product 1; read its current values.
    const available = await definitions.get(authenticatedUser.token);
    expect(available.status()).toBe(200);
    const tools: ToolDefinition[] = await available.json();
    const product = await products.get(1, authenticatedUser.token);
    expect(product.status(), 'Mock iphone scenario requires seeded product 1').toBe(200);
    const expectedProduct = await product.json();
    const payload = { model, messages: [{ role: 'user', content: iphone.prompt }], tools };

    // when
    const response = await client.chat(payload, authenticatedUser.token);

    // then
    expectCompletedStream(response, model, 'chat');
    expectToolCallsInOrder(response, [
      { name: 'list_products', arguments: { category: 'electronics', inStockOnly: true, limit: 25 } },
      { name: 'get_product_snapshot', arguments: { productId: 1 } },
    ]);
    expectToolResult(response, 'get_product_snapshot', expectedProduct);
    expectAssistantAnswerAfterTools(response, iphone.text);
  });

  test('should reject an empty tool list before streaming - 400', async ({ authenticatedUser }) => {
    // given
    const payload = { model, messages: [{ role: 'user', content: beauty.prompt }], tools: [] };

    // when
    const response = await client.chat(payload, authenticatedUser.token);

    // then
    expectJsonError(response, 400, { error: 'At least one tool definition is required' });
  });

  test('should reject missing model and history - 400', async ({ authenticatedUser }) => {
    // given
    const payload = {};

    // when
    const response = await client.chat(payload, authenticatedUser.token);

    // then
    expectJsonError(response, 400, { model: 'must not be blank', messages: 'At least one message is required' });
  });

  test('should reject an invalid message role - 400', async ({ authenticatedUser }) => {
    // given
    const payload = { model, messages: [{ role: 'invalid', content: beauty.prompt }] };

    // when
    const response = await client.chat(payload, authenticatedUser.token);

    // then
    expectJsonError(response, 400, { 'messages[0].role': "Role must be either 'system', 'user', 'assistant' or 'tool'" });
  });

  test('should reject unauthorized tool chat - 401', async ({ authenticatedUser }) => {
    // given
    const payload = { model, messages: [{ role: 'user', content: beauty.prompt }] };
    for (const { name, token, message } of unauthorizedCases(authenticatedUser.token)) {
      await test.step(name, async () => {
        // when
        const response = await client.chat(payload, token);

        // then
        expectJsonError(response, 401, { message });
      });
    }
  });
});
