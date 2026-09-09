import { ApiClient } from './apiClient';

export const OLLAMA_ENDPOINT = '/api/v1/ollama';

export class OllamaClient extends ApiClient {
  generate(payload: unknown, token?: string) {
    return this.postJson(`${OLLAMA_ENDPOINT}/generate`, payload, token);
  }

  chat(payload: unknown, token?: string) {
    return this.postJson(`${OLLAMA_ENDPOINT}/chat`, payload, token);
  }

  chatWithTools(payload: unknown, token?: string) {
    return this.postJson(`${OLLAMA_ENDPOINT}/chat/tools`, payload, token);
  }

  getToolDefinitions(token?: string) {
    return this.getJson(`${OLLAMA_ENDPOINT}/chat/tools/definitions`, token);
  }
}
