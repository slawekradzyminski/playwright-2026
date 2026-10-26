import type { APIRequestContext } from '@playwright/test';
import type { LoginDto } from '../types/auth';

export const SIGNIN_ENDPOINT = '/api/v1/users/signin';

type LoginOptions = Pick<NonNullable<Parameters<APIRequestContext['post']>[1]>, 'headers'>;

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  login(credentials: LoginDto, options?: LoginOptions) {
    return this.request.post(SIGNIN_ENDPOINT, {
      data: credentials,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  }
}
