import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { CreateQrDto } from '../../types/qr';

export class CreateQrClient {
  constructor(private readonly request: APIRequestContext) {}

  create(data: Partial<CreateQrDto>, token?: string): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/qr/create`, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
    });
  }
}
