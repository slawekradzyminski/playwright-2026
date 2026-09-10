import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class ClearCartClient {
  constructor(private readonly request: APIRequestContext) {}

  clear(token?: string): Promise<APIResponse> {
    return this.request.delete(`${APP_BASE_URL}/api/v1/cart`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
