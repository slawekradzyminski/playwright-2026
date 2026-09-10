import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { CartItemDto } from '../../types/commerce';

export class AddCartItemClient {
  constructor(private readonly request: APIRequestContext) {}

  add(data: CartItemDto, token?: string): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/cart/items`, {
      data,
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
