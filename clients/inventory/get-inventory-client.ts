import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class GetInventoryClient {
  constructor(private readonly request: APIRequestContext) {}

  get(productId: number, token: string | undefined, lowStockThreshold?: number): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/admin/inventory/${productId}`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
      params: lowStockThreshold === undefined ? undefined : { lowStockThreshold },
    });
  }
}
