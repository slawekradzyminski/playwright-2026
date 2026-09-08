import { test, expect } from '../../../fixtures/prompts.fixture';
import { PromptClient } from '../../../http/promptClient';
import { expectError, expectJson } from '../../../validators/jsonResponse';
import { expectChatSystemPrompt } from '../../../validators/promptResponse';

let client: PromptClient;
test.beforeEach(({ request }) => { client = new PromptClient(request); });

test('200 - customer updates and reads back its chat prompt without affecting another customer', async ({ loggedInUser, secondLoggedInUser }) => {
  // given
  const firstPrompt = 'Customer A chat prompt';
  const secondPrompt = 'Customer B chat prompt';

  // when
  const firstWrite = await client.updateChatSystemPrompt({ chatSystemPrompt: firstPrompt }, loggedInUser.token);
  const secondBefore = await expectChatSystemPrompt(await client.getChatSystemPrompt(secondLoggedInUser.token), 200);
  const secondWrite = await client.updateChatSystemPrompt({ chatSystemPrompt: secondPrompt }, secondLoggedInUser.token);
  const firstRead = await expectChatSystemPrompt(await client.getChatSystemPrompt(loggedInUser.token), 200);
  const secondRead = await expectChatSystemPrompt(await client.getChatSystemPrompt(secondLoggedInUser.token), 200);

  // then
  expect((await expectChatSystemPrompt(firstWrite, 200)).chatSystemPrompt).toBe(firstPrompt);
  expect(secondBefore.chatSystemPrompt).not.toBe(firstPrompt);
  expect((await expectChatSystemPrompt(secondWrite, 200)).chatSystemPrompt).toBe(secondPrompt);
  expect(firstRead.chatSystemPrompt).toBe(firstPrompt);
  expect(secondRead.chatSystemPrompt).toBe(secondPrompt);
});

test('400 - reject an overlong chat prompt without changing an existing override', async ({ loggedInUser }) => {
  // given
  const initial = await expectChatSystemPrompt(await client.updateChatSystemPrompt({ chatSystemPrompt: 'Keep this chat override' }, loggedInUser.token), 200);
  const payload = { chatSystemPrompt: 'A'.repeat(5001) };

  // when
  const response = await client.updateChatSystemPrompt(payload, loggedInUser.token);

  // then
  expect(await expectJson(response, 400)).toEqual({ chatSystemPrompt: 'Chat system prompt must be at most 5000 characters' });
  expect((await expectChatSystemPrompt(await client.getChatSystemPrompt(loggedInUser.token), 200)).chatSystemPrompt).toBe(initial.chatSystemPrompt);
});

// BUG-027: 401 bodies are error objects although the OpenAPI response schema references the prompt DTO; see ../../../reports/bugs/BUG-027-prompt-error-schema-mismatch.md.
for (const scenario of ['anonymous', 'invalid bearer'] as const) {
  test(`401 - reject ${scenario} chat prompt update`, async () => {
    // given
    const token = scenario === 'anonymous' ? undefined : 'invalid-token';
    const payload = { chatSystemPrompt: 'unauthorized probe' };

    // when
    const response = await client.updateChatSystemPrompt(payload, token);

    // then
    await expectError(response, 401, scenario === 'anonymous' ? 'Unauthorized' : 'Invalid or expired token');
  });
}
