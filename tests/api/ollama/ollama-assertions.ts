import { expect } from '@playwright/test';
import { parseOllamaEvents } from '../../../http/ollama-client';
import type { OllamaEvent } from '../../../types/ollama';

export function expectMotivationalQuote(events: OllamaEvent[], model: string): void {
  expect(events.length).toBeGreaterThan(1);
  expect(events.map(event => event.response ?? '').join('')).toBe('Keep shipping mock services — momentum beats perfection.');
  expect(events.filter(event => event.done)).toHaveLength(1);
  expect(events.at(-1)).toMatchObject({ model, done: true });
  expect(events.every(event => !event.thinking)).toBe(true);
}

export function expectReleasePlanWithThinking(events: OllamaEvent[]): void {
  expect(events.map(event => event.thinking ?? '').join('')).toContain('release checklist');
  expect(events.map(event => event.response ?? '').join('')).toContain('Release plan:');
  expect(events.at(-1)?.done).toBe(true);
}

export function expectMockStatusUpdate(events: OllamaEvent[], model: string): void {
  expect(events.map(event => event.message?.content ?? '').join('')).toContain('streams deterministic responses');
  expect(events.at(-1)).toMatchObject({ model, done: true });
  expect(events.filter(event => event.done)).toHaveLength(1);
}

export function expectBeautyCatalogLookup(events: OllamaEvent[]): void {
  const call = events.findIndex(event => event.message?.tool_calls?.some(tool => tool.function.name === 'list_products'));
  const result = events.findIndex(event => event.message?.role === 'tool' && event.message.tool_name === 'list_products');
  expect(call, 'The assistant requests the product list').toBeGreaterThanOrEqual(0);
  expect(result, 'The tool returns a result after the request').toBeGreaterThan(call);
  expect(JSON.parse(events[result].message!.content!)).toEqual(expect.any(Object));
  expect(events.slice(result + 1).map(event => event.message?.content ?? '').join('')).toContain('beauty shelf');
  expect(events.at(-1)?.done).toBe(true);
}

export function expectCatalogToolDefinitions(definitions: unknown): void {
  expect(definitions).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'function', function: expect.objectContaining({ name: 'list_products', parameters: expect.any(Object) }) }),
    expect.objectContaining({ type: 'function', function: expect.objectContaining({ name: 'get_product_snapshot', parameters: expect.any(Object) }) }),
  ]));
}

export async function expectIncrementalCompletedStream(response: Response): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let body = '';
  let receivedEventBeforeCompletion = false;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    body += decoder.decode(part.value, { stream: true });
    if (!receivedEventBeforeCompletion && /\r?\n\r?\n/.test(body)) {
      const blocks = body.split(/\r?\n\r?\n/);
      const completeEvents = parseOllamaEvents(blocks.slice(0, -1).join('\n\n'));
      expect(completeEvents[0].done).toBe(false);
      expect(completeEvents.some(event => event.done)).toBe(false);
      receivedEventBeforeCompletion = true;
    }
  }
  expect(receivedEventBeforeCompletion).toBe(true);
  expect(parseOllamaEvents(body).at(-1)?.done).toBe(true);
}
