import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { ProductCreateDto } from '../../types/product';

export class CreateProductClient {
  constructor(private readonly request: APIRequestContext) {}

  create(data: ProductCreateDto, token?: string): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/products`, {
      data,
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
