import type { APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';

export const CART_ENDPOINT = '/api/v1/cart';

export class CartClient extends ApiClient {
  getCart(token?: string): Promise<APIResponse> {
    return this.getJson(CART_ENDPOINT, token);
  }

  addItem(payload: unknown, token?: string): Promise<APIResponse> {
    return this.postJson(`${CART_ENDPOINT}/items`, payload, token);
  }

  updateItem(productId: number | string, payload: unknown, token?: string): Promise<APIResponse> {
    return this.putJson(`${CART_ENDPOINT}/items/${productId}`, payload, token);
  }

  removeItem(productId: number | string, token?: string): Promise<APIResponse> {
    return this.deleteRequest(`${CART_ENDPOINT}/items/${productId}`, token);
  }

  clearCart(token?: string): Promise<APIResponse> {
    return this.deleteRequest(CART_ENDPOINT, token);
  }
}
