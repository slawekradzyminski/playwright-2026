import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';

export class DeleteUserClient {
  constructor(private readonly request: APIRequestContext) {}

  deleteUser(username: string, token: string): Promise<APIResponse> {
    return this.request.delete(`${APP_BASE_URL}/api/v1/users/${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
