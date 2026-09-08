import { expect, type APIResponse } from '@playwright/test';
import type { LoginResponseDto } from '../types/auth';
import { expectJson } from './jsonResponse';
import { expectValidJwt } from './jwt';

const BASE64_URL = /^[A-Za-z0-9_-]+$/;

export function expectValidOpaqueToken(token: unknown, fieldName: string): asserts token is string {
  expect(token, `${fieldName} must be a non-empty base64url string`)
    .toEqual(expect.stringMatching(BASE64_URL));
}

export async function expectValidLoginResponse(
  response: APIResponse,
  expectedUsername: string
): Promise<LoginResponseDto> {
  const body = await expectJson<LoginResponseDto>(response, 200);

  expectValidJwt(body.token);
  expectValidOpaqueToken(body.refreshToken, 'refreshToken');

  expect(body).toMatchObject({
    username: expectedUsername,
    email: expect.any(String),
    firstName: expect.any(String),
    lastName: expect.any(String),
    roles: expect.any(Array),
  });

  expect(body.roles).not.toHaveLength(0);

  return body;
}
