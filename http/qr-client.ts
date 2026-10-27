import type { APIRequestContext } from '@playwright/test';
import type { CreateQrDto } from '../types/qr';

export const CREATE_QR_ENDPOINT = '/api/v1/qr/create';

export class QrClient {
  constructor(private readonly request: APIRequestContext, private readonly token?: string) {}

  create(payload: CreateQrDto) {
    return this.request.post(CREATE_QR_ENDPOINT, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });
  }
}
