import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';

export const USERS_ENDPOINT = '/api/v1/users';

export class UserClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  deleteUser(username: string, token: string): Promise<APIResponse> {
    return this.deleteRequest(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`, token);
  }
}
