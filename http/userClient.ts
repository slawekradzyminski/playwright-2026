import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';

export const USERS_ENDPOINT = '/api/v1/users';

export class UserClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  deleteUser(username: string, token?: string): Promise<APIResponse> {
    return this.deleteRequest(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`, token);
  }

  getUsers(token?: string): Promise<APIResponse> {
    return this.getJson(USERS_ENDPOINT, token);
  }

  getUser(username: string, token?: string): Promise<APIResponse> {
    return this.getJson(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`, token);
  }

  updateUser(username: string, payload: unknown, token?: string): Promise<APIResponse> {
    return this.putJson(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`, payload, token);
  }

  deleteRightToBeForgotten(username: string, token?: string): Promise<APIResponse> {
    return this.deleteRequest(`${USERS_ENDPOINT}/${encodeURIComponent(username)}/right-to-be-forgotten`, token);
  }
}
