import type { APIRequestContext } from '@playwright/test';
import type { CartItemDto, UpdateCartItemDto } from '../types/cart';

export const CART_ENDPOINT = '/api/v1/cart';
export const CART_ITEMS_ENDPOINT = `${CART_ENDPOINT}/items`;

// Without a token the client sends unauthenticated requests.
export class CartClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  getCart() {
    return this.request.get(CART_ENDPOINT, { headers: this.authHeaders() });
  }

  addItem(item: CartItemDto) {
    return this.request.post(CART_ITEMS_ENDPOINT, {
      data: item,
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
    });
  }

  updateItem(productId: number, update: UpdateCartItemDto) {
    return this.request.put(`${CART_ITEMS_ENDPOINT}/${productId}`, {
      data: update,
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
    });
  }

  removeItem(productId: number) {
    return this.request.delete(`${CART_ITEMS_ENDPOINT}/${productId}`, { headers: this.authHeaders() });
  }

  clear() {
    return this.request.delete(CART_ENDPOINT, { headers: this.authHeaders() });
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
