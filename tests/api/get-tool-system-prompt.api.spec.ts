import { expect } from '@playwright/test';
import { test } from '../../fixtures/authenticated-user-fixture';
import { GetToolSystemPromptClient } from '../../clients/get-tool-system-prompt-client';
import { UpdateToolSystemPromptClient } from '../../clients/update-tool-system-prompt-client';
import { unauthorizedCases } from './test-data/unauthorized-cases';

test.describe('GET /api/v1/users/tool-system-prompt', () => {
  let client: GetToolSystemPromptClient;
  let updateClient: UpdateToolSystemPromptClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new GetToolSystemPromptClient(request);
    updateClient = new UpdateToolSystemPromptClient(request);
  });

  test('should return the default prompt for a new user - 200', async ({ authenticatedUser }) => {
    // given
    const { token } = authenticatedUser;

    // when
    const response = await client.get(token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ toolSystemPrompt: expect.stringMatching(/\S+/) });
  });

  test('should return the stored override - 200', async ({ authenticatedUser }) => {
    // given
    const { token } = authenticatedUser;
    const prompt = 'Use supplied context.\nPreserve Unicode: zażółć 🌍';
    expect((await updateClient.update(prompt, token)).status()).toBe(200);

    // when
    const response = await client.get(token);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ toolSystemPrompt: prompt });
  });

  test('should reject unauthorized requests - 401', async ({ authenticatedUser }) => {
    // given
    const cases = unauthorizedCases(authenticatedUser.token);

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
