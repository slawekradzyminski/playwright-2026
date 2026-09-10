import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { OrderQuery } from '../../types/commerce';

export class GetAllOrdersClient {
  constructor(private readonly request: APIRequestContext) {}

  get(token?: string, query: OrderQuery = {}): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/orders/admin`, {
      params: { ...query },
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
