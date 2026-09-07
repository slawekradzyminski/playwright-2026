import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';

export class ApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    private readonly baseUrl = APP_BASE_URL
  ) {}

  protected postJson<TPayload>(endpoint: string, payload: TPayload, token?: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${endpoint}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  }

  protected putJson(endpoint: string, payload: unknown, token?: string): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}${endpoint}`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
  }

  protected getJson(endpoint: string, token?: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  }

  protected deleteRequest(endpoint: string, token?: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  }
}
