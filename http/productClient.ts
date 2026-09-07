import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';

export const PRODUCTS_ENDPOINT = '/api/v1/products';

export class ProductClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  createProduct(payload: unknown, token?: string): Promise<APIResponse> {
    return this.postJson(PRODUCTS_ENDPOINT, payload, token);
  }

  updateProduct(id: number | string, payload: unknown, token?: string): Promise<APIResponse> {
    return this.putJson(`${PRODUCTS_ENDPOINT}/${id}`, payload, token);
  }

  deleteProduct(id: number | string, token?: string): Promise<APIResponse> {
    return this.deleteRequest(`${PRODUCTS_ENDPOINT}/${id}`, token);
  }

  getAllProducts(token?: string): Promise<APIResponse> {
    return this.getJson(PRODUCTS_ENDPOINT, token);
  }

  getProductById(id: number | string, token?: string): Promise<APIResponse> {
    return this.getJson(`${PRODUCTS_ENDPOINT}/${id}`, token);
  }
}
