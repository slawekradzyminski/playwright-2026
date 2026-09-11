import { expect } from '@playwright/test';
import { test } from '../../../fixtures/shared/account';
import { GetChatSystemPromptClient } from '../../../clients/users/get-chat-system-prompt-client';
import { UpdateChatSystemPromptClient } from '../../../clients/users/update-chat-system-prompt-client';
import { unauthorizedCases } from '../test-data/unauthorized-cases';

test.describe('GET /api/v1/users/chat-system-prompt', () => {
  let client: GetChatSystemPromptClient;
  let updateClient: UpdateChatSystemPromptClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new GetChatSystemPromptClient(request);
    updateClient = new UpdateChatSystemPromptClient(request);
  });

  test('should return the default prompt for a new user - 200', async ({ account }) => {
    // given
    const { token } = account;

    // when
    const response = await client.get(token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ chatSystemPrompt: expect.stringMatching(/\S+/) });
  });

  test('should return the stored override - 200', async ({ account }) => {
    // given
    const { token } = account;
    const prompt = 'Use supplied context.\nPreserve Unicode: zażółć 🌍';
    expect((await updateClient.update(prompt, token)).status()).toBe(200);

    // when
    const response = await client.get(token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ chatSystemPrompt: prompt });
  });

  test('should reject unauthorized requests - 401', async ({ account }) => {
    // given
    const cases = unauthorizedCases(account.token);

    for (const { name, token, message } of cases) {
      await test.step(name, async () => {
        // when
        const response = await client.get(token);

        // then
        expect.soft(response.status()).toBe(401);
        expect.soft(await response.json()).toEqual({ message });
      });
    }
  });
});
