import { expect, type APIRequestContext } from '@playwright/test';
import type { CartDto, CartItemDto } from '../types/product';

const CART_ENDPOINT = '/api/v1/cart';

/** Works on the cart of the user the token belongs to. */
export class CartApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  async get(): Promise<CartDto> {
    const response = await this.request.get(CART_ENDPOINT, { headers: this.headers() });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async addItem(item: CartItemDto): Promise<CartDto> {
    const response = await this.request.post(`${CART_ENDPOINT}/items`, { data: item, headers: this.headers() });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async clear() {
    const response = await this.request.delete(CART_ENDPOINT, { headers: this.headers() });
    expect(response.status()).toBe(204);
  }

  private headers() {
    return { Authorization: `Bearer ${this.token}` };
  }
}
