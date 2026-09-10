import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { UserRegisterDto } from '../types/auth';
import { APP_BASE_URL } from '../test-config';

export class SignupClient {
  constructor(private readonly request: APIRequestContext) {}

  signup(user: UserRegisterDto): Promise<APIResponse> {
    return this.signupRaw(user);
  }

  /** Allows deliberately invalid payloads without weakening the valid DTO. */
  signupRaw(data: unknown): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/users/signup`, {
      data,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
