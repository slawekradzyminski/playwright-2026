import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { ProductUpdateDto } from '../../types/product';

export class UpdateProductClient {
  constructor(private readonly request: APIRequestContext) {}

  update(id: number | string, data: ProductUpdateDto, token?: string): Promise<APIResponse> {
    return this.request.put(`${APP_BASE_URL}/api/v1/products/${id}`, {
      data,
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
