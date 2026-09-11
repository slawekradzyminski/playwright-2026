import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { ForgotPasswordRequestDto } from '../../types/account';

export class ForgotPasswordClient {
  constructor(private readonly request: APIRequestContext) {}

  requestReset(data: ForgotPasswordRequestDto): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/users/password/forgot`, { data });
  }
}
