import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { InventoryAdjustmentDto } from '../../types/inventory';

export class AdjustInventoryClient {
  constructor(private readonly request: APIRequestContext) {}

  adjust(productId: number, data: Partial<InventoryAdjustmentDto>, token: string | undefined): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/admin/inventory/${productId}/adjustments`, {
      data,
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
