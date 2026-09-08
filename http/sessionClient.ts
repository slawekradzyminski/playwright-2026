import { ApiClient } from './apiClient';

export class SessionClient extends ApiClient {
  refresh(payload: unknown) {
    return this.postJson('/api/v1/users/refresh', payload);
  }

  logout(token?: string) {
    return this.postJson('/api/v1/users/logout', undefined, token);
  }

  me(token?: string) {
    return this.getJson('/api/v1/users/me', token);
  }
}
