import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';

export class ApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    private readonly baseUrl = APP_BASE_URL
  ) {}

  protected postJson<TPayload>(endpoint: string, payload: TPayload): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${endpoint}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
