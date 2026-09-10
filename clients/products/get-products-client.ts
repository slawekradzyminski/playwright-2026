import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class GetProductsClient {
  constructor(private readonly request: APIRequestContext) {}

  get(token?: string): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/products`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
