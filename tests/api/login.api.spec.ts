import { test, expect } from '@playwright/test';
import type { LoginDto, LoginResponseDto } from '../../types/auth';

const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:8081';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'LocalDemoAdmin123!';
const SIGNIN_ENDPOINT = '/api/v1/users/signin';

test.describe('/api/v1/users/signin API tests', () => {
  test('should successfully authenticate with valid credentials - 200', async ({ request }) => {
    // given
    const loginData: LoginDto = {
      username: 'admin',
      password: ADMIN_PASSWORD
    };

    // when
    const response = await request.post(`${APP_BASE_URL}${SIGNIN_ENDPOINT}`, {
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // then
    expect(response.status()).toBe(200);

    const responseBody: LoginResponseDto = await response.json();
    expect(responseBody.token).toBeDefined();
    expect(responseBody.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    expect(responseBody.username).toBe(loginData.username);
    expect(responseBody.email).toBeDefined();
    expect(responseBody.firstName).toBeDefined();
    expect(responseBody.lastName).toBeDefined();
    expect(responseBody.roles).toBeDefined();
    expect(Array.isArray(responseBody.roles)).toBe(true);
  });

  test('should return validation error for empty username - 400', async ({ request }) => {
    // given
    const loginData: LoginDto = {
      username: '',
      password: ADMIN_PASSWORD
    };

    // when
    const response = await request.post(`${APP_BASE_URL}${SIGNIN_ENDPOINT}`, {
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // then
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.username).toBe('Minimum username length: 4 characters');
  });

  test('should return validation error for username too short - 400', async ({ request }) => {
    // given
    const loginData: LoginDto = {
      username: 'abc',
      password: ADMIN_PASSWORD
    };

    // when
    const response = await request.post(`${APP_BASE_URL}${SIGNIN_ENDPOINT}`, {
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // then
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.username).toBe('Minimum username length: 4 characters');
  });

  test('should return validation error for password too short - 400', async ({ request }) => {
    // given
    const loginData: LoginDto = {
      username: 'admin',
      password: 'abc'
    };

    // when
    const response = await request.post(`${APP_BASE_URL}${SIGNIN_ENDPOINT}`, {
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // then
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.password).toBe('Minimum password length: 4 characters');
  });

  test('should return authentication error for both invalid credentials - 422', async ({ request }) => {
    // given
    const loginData: LoginDto = {
      username: 'wronguser',
      password: 'wrongpassword'
    };

    // when
    const response = await request.post(`${APP_BASE_URL}${SIGNIN_ENDPOINT}`, {
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // then
    expect(response.status()).toBe(422);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Invalid username/password supplied');
  });
}); 
