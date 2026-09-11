import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class RightToBeForgottenClient {
  constructor(private readonly request: APIRequestContext) {}

  forget(username: string, token?: string): Promise<APIResponse> {
    return this.request.delete(`${APP_BASE_URL}/api/v1/users/${encodeURIComponent(username)}/right-to-be-forgotten`, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    });
  }
}
