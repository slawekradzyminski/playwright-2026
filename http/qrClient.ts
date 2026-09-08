import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { CreateQrDto } from '../types/qr';
import { ApiClient } from './apiClient';

export const QR_CREATE_ENDPOINT = '/api/v1/qr/create';

export class QrClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  createQrCode(payload: Partial<CreateQrDto>, token?: string): Promise<APIResponse> {
    return this.postJson(QR_CREATE_ENDPOINT, payload, token);
  }
}
