import type { APIRequestContext } from '@playwright/test';
import type { OllamaEvent, OllamaRequest } from '../types/ollama';
import { APP_BASE_URL } from '../test-config';

export class OllamaClient {
  constructor(private readonly request: APIRequestContext, private readonly token?: string) {}

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  generate(data: OllamaRequest) {
    return this.request.post('/api/v1/ollama/generate', { data, headers: this.headers(), timeout: 30000 });
  }

  chat(data: OllamaRequest) {
    return this.request.post('/api/v1/ollama/chat', { data, headers: this.headers(), timeout: 30000 });
  }

  chatTools(data: OllamaRequest) {
    return this.request.post('/api/v1/ollama/chat/tools', { data, headers: this.headers(), timeout: 30000 });
  }

  generateStream(data: OllamaRequest, signal: AbortSignal) {
    return fetch(`${APP_BASE_URL}/api/v1/ollama/generate`, {
      method: 'POST', headers: { ...this.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data), signal,
    });
  }

  definitions() {
    return this.request.get('/api/v1/ollama/chat/tools/definitions', { headers: this.headers() });
  }
}

// SSE allows several data lines per event. A blank line terminates the event.
export function parseOllamaEvents(body: string): OllamaEvent[] {
  return body.replace(/\r\n/g, '\n').split('\n\n').flatMap(block => {
    const data = block.split('\n').filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).replace(/^ /, '')).join('\n');
    return data ? [JSON.parse(data) as OllamaEvent] : [];
  });
}
