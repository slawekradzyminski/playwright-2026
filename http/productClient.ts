import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';

export const PRODUCTS_ENDPOINT = '/api/v1/products';

export class ProductClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getAllProducts(token?: string): Promise<APIResponse> {
    return this.getJson(PRODUCTS_ENDPOINT, token);
  }

  getProductById(id: number | string, token?: string): Promise<APIResponse> {
    return this.getJson(`${PRODUCTS_ENDPOINT}/${id}`, token);
  }
}
