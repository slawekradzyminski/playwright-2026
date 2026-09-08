import { ApiClient } from './apiClient';
import type { OrderStatus } from '../types/order';

type OrderQuery = { page?: number; size?: number; status?: OrderStatus | string };

export class OrderClient extends ApiClient {
  create(address: unknown, token?: string) {
    return this.postJson('/api/v1/orders', address, token);
  }

  get(id: number | string, token?: string) {
    return this.getJson(`/api/v1/orders/${id}`, token);
  }

  list(query: OrderQuery = {}, token?: string) {
    return this.getJson(`/api/v1/orders${this.queryString(query)}`, token);
  }

  listAdmin(query: OrderQuery = {}, token?: string) {
    return this.getJson(`/api/v1/orders/admin${this.queryString(query)}`, token);
  }

  cancel(id: number | string, token?: string) {
    return this.postJson(`/api/v1/orders/${id}/cancel`, undefined, token);
  }

  updateStatus(id: number | string, status: OrderStatus, token?: string) {
    // The endpoint consumes a JSON string, not an object or an unquoted string.
    return this.putJson(`/api/v1/orders/${id}/status`, JSON.stringify(status), token);
  }

  private queryString(query: OrderQuery) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
    return params.size ? `?${params}` : '';
  }
}
