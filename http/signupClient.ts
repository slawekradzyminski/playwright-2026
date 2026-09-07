import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { SignupDto } from '../types/auth';
import { ApiClient } from './apiClient';

export const SIGNUP_ENDPOINT = '/api/v1/users/signup';

export class SignupClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  signUp(payload: SignupDto): Promise<APIResponse> {
    return this.postJson(SIGNUP_ENDPOINT, payload);
  }
}
