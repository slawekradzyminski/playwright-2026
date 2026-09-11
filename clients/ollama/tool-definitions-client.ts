import type { APIRequestContext } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class ToolDefinitionsClient {
  constructor(private readonly request: APIRequestContext) {}

  get(token?: string) {
    return this.request.get(`${APP_BASE_URL}/api/v1/ollama/chat/tools/definitions`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
