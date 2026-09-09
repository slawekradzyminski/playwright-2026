// Deterministic upstream contract: slawekradzyminski/ollama-mock v1.0.9,
// src/main/resources/scenarios/{generate,chat-dialog,chat}-scenarios.json.
// These expectations are intentionally independent of the running service.
// This coverage requires the mock; it does not assess real-model quality.
export const OLLAMA_MODEL = 'qwen3.5:2b';

export const releaseScenario = {
  prompt: 'Summarize the release plan',
  answer: 'Release plan: qwen3.5:2b is the default mock model, frontend hooks can stay untouched, and integration smoke test is scheduled after Phase 4. Ping me if you need more depth.',
  thinking: 'Reviewing the qwen3.5:2b release checklist before drafting the summary...'
};

export const quoteScenario = {
  prompt: 'Provide a motivational quote',
  answer: 'Keep shipping mock services — momentum beats perfection.'
};

export const statusScenario = {
  prompt: 'Give me a quick status update on the Ollama mock',
  answer: 'The Ollama mock is up on port 11434, defaults to qwen3.5:2b, and streams deterministic responses so backend/frontend teams can skip the heavy container during the local profile.',
  thinking: 'Reviewing the latest notes about the local mock server and its qwen3.5:2b default...'
};

export const beautyScenario = {
  prompt: 'What Beauty products do we have available?',
  answer: 'The beauty shelf currently offers: Hydrating Face Serum and Velvet Matte Lipstick. Let me know if you want pricing for either product.',
  tool: 'list_products',
  arguments: { category: 'beauty', inStockOnly: true, limit: 25 }
};
