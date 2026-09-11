import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { InventoryListQuery } from '../../types/inventory';

export class ListInventoryClient {
  constructor(private readonly request: APIRequestContext) {}

  list(token: string | undefined, query?: InventoryListQuery): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/admin/inventory`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
      params: { ...query },
    });
  }
}
