import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class GetEmailEventsClient {
  constructor(private readonly request: APIRequestContext) {}

  get(token?: string): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/users/me/email-events`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
