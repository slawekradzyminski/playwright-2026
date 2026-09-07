import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { LoginDto } from '../types/auth';
import { ApiClient } from './apiClient';

export const SIGNIN_ENDPOINT = '/api/v1/users/signin';

export class LoginClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  signIn(credentials: LoginDto): Promise<APIResponse> {
    return this.postJson(SIGNIN_ENDPOINT, credentials);
  }
}
