import { test, expect } from '../../../fixtures/prompts.fixture';
import { PromptClient } from '../../../http/promptClient';
import { expectError, expectJson } from '../../../validators/jsonResponse';
import { expectToolSystemPrompt } from '../../../validators/promptResponse';

let client: PromptClient;
test.beforeEach(({ request }) => { client = new PromptClient(request); });

test('200 - customer updates and reads back its tool prompt without affecting another customer', async ({ loggedInUser, secondLoggedInUser }) => {
  // given
  const firstPrompt = 'Customer A tool prompt';
  const secondPrompt = 'Customer B tool prompt';

  // when
  const firstWrite = await client.updateToolSystemPrompt({ toolSystemPrompt: firstPrompt }, loggedInUser.token);
  const secondBefore = await expectToolSystemPrompt(await client.getToolSystemPrompt(secondLoggedInUser.token), 200);
  const secondWrite = await client.updateToolSystemPrompt({ toolSystemPrompt: secondPrompt }, secondLoggedInUser.token);
  const firstRead = await expectToolSystemPrompt(await client.getToolSystemPrompt(loggedInUser.token), 200);
  const secondRead = await expectToolSystemPrompt(await client.getToolSystemPrompt(secondLoggedInUser.token), 200);

  // then
  expect((await expectToolSystemPrompt(firstWrite, 200)).toolSystemPrompt).toBe(firstPrompt);
  expect(secondBefore.toolSystemPrompt).not.toBe(firstPrompt);
  expect((await expectToolSystemPrompt(secondWrite, 200)).toolSystemPrompt).toBe(secondPrompt);
  expect(firstRead.toolSystemPrompt).toBe(firstPrompt);
  expect(secondRead.toolSystemPrompt).toBe(secondPrompt);
});

test('400 - reject an overlong tool prompt without changing an existing override', async ({ loggedInUser }) => {
  // given
  const initial = await expectToolSystemPrompt(await client.updateToolSystemPrompt({ toolSystemPrompt: 'Keep this tool override' }, loggedInUser.token), 200);
  const payload = { toolSystemPrompt: 'B'.repeat(5001) };

  // when
  const response = await client.updateToolSystemPrompt(payload, loggedInUser.token);

  // then
  expect(await expectJson(response, 400)).toEqual({ toolSystemPrompt: 'Tool system prompt must be at most 5000 characters' });
  expect((await expectToolSystemPrompt(await client.getToolSystemPrompt(loggedInUser.token), 200)).toolSystemPrompt).toBe(initial.toolSystemPrompt);
});

// BUG-027: 401 bodies are error objects although the OpenAPI response schema references the prompt DTO; see ../../../reports/bugs/BUG-027-prompt-error-schema-mismatch.md.
for (const scenario of ['anonymous', 'invalid bearer'] as const) {
  test(`401 - reject ${scenario} tool prompt update`, async () => {
    // given
    const token = scenario === 'anonymous' ? undefined : 'invalid-token';
    const payload = { toolSystemPrompt: 'unauthorized probe' };

    // when
    const response = await client.updateToolSystemPrompt(payload, token);

    // then
    await expectError(response, 401, scenario === 'anonymous' ? 'Unauthorized' : 'Invalid or expired token');
  });
}
