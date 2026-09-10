import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class UpdateCartItemClient {
  constructor(private readonly request: APIRequestContext) {}

  update(productId: number | string, data: { quantity: number }, token?: string): Promise<APIResponse> {
    return this.request.put(`${APP_BASE_URL}/api/v1/cart/items/${encodeURIComponent(productId)}`, {
      data,
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
