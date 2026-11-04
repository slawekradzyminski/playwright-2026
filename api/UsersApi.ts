import { expect, type APIRequestContext } from '@playwright/test';
import type { LoginDto, LoginResponseDto, RegisterDto } from '../types/auth';

const USERS_ENDPOINT = '/api/v1/users';
const SIGNUP_ENDPOINT = `${USERS_ENDPOINT}/signup`;
const SIGNIN_ENDPOINT = `${USERS_ENDPOINT}/signin`;

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async signup(user: RegisterDto) {
    const response = await this.request.post(SIGNUP_ENDPOINT, { data: user });
    expect(response.status()).toBe(201);
  }

  async signin(credentials: LoginDto): Promise<LoginResponseDto> {
    const response = await this.request.post(SIGNIN_ENDPOINT, { data: credentials });
    expect(response.status()).toBe(200);
    return response.json();
  }

  /** Requires an admin token; the backend answers 403 for anyone else. */
  async deleteUser(username: string, adminToken: string) {
    const response = await this.request.delete(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(204);
  }
}
