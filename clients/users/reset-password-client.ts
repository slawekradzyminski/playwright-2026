import type { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_BASE_URL } from '../../test-config';
import type { ResetPasswordRequestDto } from '../../types/account';

export class ResetPasswordClient {
  constructor(private readonly request: APIRequestContext) {}

  reset(data: ResetPasswordRequestDto): Promise<APIResponse> {
    return this.request.post(`${APP_BASE_URL}/api/v1/users/password/reset`, { data });
  }
}
