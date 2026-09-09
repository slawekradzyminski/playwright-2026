import { expect, type APIResponse } from '@playwright/test';
import type { OllamaChunk, ToolDefinition } from '../types/ollama';

export async function expectOllamaStream(response: APIResponse, model: string): Promise<OllamaChunk[]> {
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/event-stream');
  const text = await response.text();
  // Spring emits pretty-printed JSON across several data: lines per SSE event.
  const chunks = text.split(/\r?\n\r?\n/)
    .map(event => event.split(/\r?\n/).filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).replace(/^ /, '')).join('\n'))
    .filter(Boolean)
    .map(data => JSON.parse(data) as OllamaChunk);
  expect(chunks.length, 'Multiple serialized stream events').toBeGreaterThan(1);
  for (const chunk of chunks) {
    expect(chunk.model).toBe(model);
    expect(typeof chunk.done).toBe('boolean');
    expect(Number.isNaN(Date.parse(chunk.created_at))).toBe(false);
  }
  expect(chunks.at(-1)?.done, 'Stream completes with a terminal event').toBe(true);
  return chunks;
}

export function assistantText(chunks: OllamaChunk[]): string {
  return chunks.map(chunk => chunk.response ??
    (chunk.message?.role === 'assistant' ? chunk.message.content : '') ?? '').join('');
}

export function thinkingText(chunks: OllamaChunk[]): string {
  return chunks.map(chunk => chunk.thinking ?? chunk.message?.thinking ?? '').join('');
}

export async function expectOllamaError(response: APIResponse, status: number, body: Record<string, string>) {
  expect(response.status()).toBe(status);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual(body);
}

export function expectToolDefinitions(definitions: ToolDefinition[]) {
  expect(definitions.map(tool => tool.function.name).sort()).toEqual(['get_product_snapshot', 'list_products']);
  for (const tool of definitions) {
    expect(tool.type).toBe('function');
    expect(tool.function.description.length).toBeGreaterThan(0);
    expect(tool.function.parameters.type).toBe('object');
  }
  const snapshot = definitions.find(tool => tool.function.name === 'get_product_snapshot')!.function.parameters;
  expect(snapshot.properties).toMatchObject({ productId: { type: 'integer' }, name: { type: 'string' } });
  expect(snapshot.oneOf).toEqual([{ required: ['productId'] }, { required: ['name'] }]);
  const catalog = definitions.find(tool => tool.function.name === 'list_products')!.function.parameters;
  expect(catalog.properties).toMatchObject({
    category: { type: 'string' }, inStockOnly: { type: 'boolean' },
    limit: { type: 'integer' }, offset: { type: 'integer' }
  });
}
