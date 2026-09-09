import { test, expect } from '../../../fixtures/prompts.fixture';
import { PromptClient } from '../../../http/promptClient';
import { expectError } from '../../../validators/jsonResponse';
import { expectChatSystemPrompt } from '../../../validators/promptResponse';

let client: PromptClient;
test.beforeEach(({ request }) => { client = new PromptClient(request); });

test('200 - customer receives the chat default', async ({ loggedInUser }) => {
  // given
  const firstToken = loggedInUser.token;
  // when
  const firstResponse = await client.getChatSystemPrompt(firstToken);

  // then
  const first = await expectChatSystemPrompt(firstResponse, 200);
  expect(first.chatSystemPrompt).toBeTruthy();
});

// BUG-027: 401 bodies are error objects although the OpenAPI response schema references the prompt DTO; see ../../../reports/bugs/[M][D]-BUG-027-prompt-error-schema-mismatch.md.
for (const scenario of ['anonymous', 'invalid bearer'] as const) {
  test(`401 - reject ${scenario} chat prompt lookup`, async () => {
    // given
    const token = scenario === 'anonymous' ? undefined : 'invalid-token';

    // when
    const response = await client.getChatSystemPrompt(token);

    // then
    await expectError(response, 401, scenario === 'anonymous' ? 'Unauthorized' : 'Invalid or expired token');
  });
}
