import { test } from '../../../fixtures/auth.fixture';
import { LlmToolsPage } from '../../../pages/LlmToolsPage';

test.describe('LLM tools UI tests', () => {
  test('should render deterministic tool call and assistant response from the catalog mock', async ({ page }) => {
    // given
    const toolsPage = new LlmToolsPage(page);
    const question = 'What Beauty products do we have available?';
    await toolsPage.goto();
    await toolsPage.verifyLoaded();

    // when
    await toolsPage.askQuestion(question);

    // then
    await toolsPage.verifyToolResponseContains([
      question,
      'Function call requested',
      'list_products',
      '"category":"beauty"',
      'The beauty shelf currently offers: Hydrating Face Serum and Velvet Matte Lipstick'
    ]);
  });
});
