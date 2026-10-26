import type { APIRequestContext } from '@playwright/test';
import type { UserRegisterDto } from '../types/user';

type RegisterOptions = Pick<NonNullable<Parameters<APIRequestContext['post']>[1]>, 'headers'>;

export class UsersClient {
  constructor(private readonly request: APIRequestContext) {}

  register(user: UserRegisterDto, options?: RegisterOptions) {
    return this.request.post('/api/v1/users/signup', {
      data: user,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  }

  delete(username: string, adminToken: string) {
    return this.request.delete(`/api/v1/users/${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }
}
