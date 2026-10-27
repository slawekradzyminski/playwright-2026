import type { APIRequestContext } from '@playwright/test';
import type { UserEditDto, UserRegisterDto } from '../types/user';

type RegisterOptions = Pick<NonNullable<Parameters<APIRequestContext['post']>[1]>, 'headers'>;

export class UsersClient {
  constructor(private readonly request: APIRequestContext, private readonly token?: string) {}

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  getAll() {
    return this.request.get('/api/v1/users', { headers: this.authHeaders() });
  }

  getByUsername(username: string) {
    return this.request.get(`/api/v1/users/${encodeURIComponent(username)}`, {
      headers: this.authHeaders(),
    });
  }

  getMe() {
    return this.request.get('/api/v1/users/me', { headers: this.authHeaders() });
  }

  update(username: string, user: UserEditDto) {
    return this.request.put(`/api/v1/users/${encodeURIComponent(username)}`, {
      data: user,
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
    });
  }

  register(user: UserRegisterDto, options?: RegisterOptions) {
    return this.request.post('/api/v1/users/signup', {
      data: user,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  }

  delete(username: string, token = this.token) {
    return this.request.delete(`/api/v1/users/${encodeURIComponent(username)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}
