import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class GetProductByIdClient {
  constructor(private readonly request: APIRequestContext) {}

  get(id: number | string, token?: string): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/products/${id}`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
