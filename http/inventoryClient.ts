import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';
import type { InventoryAdjustmentDto } from '../types/inventory';

export const INVENTORY_ENDPOINT = '/api/v1/admin/inventory';

export class InventoryClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  list(query = '', token?: string): Promise<APIResponse> {
    return this.getJson(`${INVENTORY_ENDPOINT}${query ? `?${query}` : ''}`, token);
  }

  get(productId: number | string, query = '', token?: string): Promise<APIResponse> {
    return this.getJson(`${INVENTORY_ENDPOINT}/${productId}${query ? `?${query}` : ''}`, token);
  }

  movements(productId: number | string, query = '', token?: string): Promise<APIResponse> {
    return this.getJson(`${INVENTORY_ENDPOINT}/${productId}/movements${query ? `?${query}` : ''}`, token);
  }

  adjust(productId: number | string, payload: InventoryAdjustmentDto, token?: string): Promise<APIResponse> {
    return this.postJson(`${INVENTORY_ENDPOINT}/${productId}/adjustments`, payload, token);
  }
}
