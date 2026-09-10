import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class CurrentUserClient {
  constructor(private readonly request: APIRequestContext) {}

  getMe(token?: string): Promise<APIResponse> {
    return this.request.get(`${APP_BASE_URL}/api/v1/users/me`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
