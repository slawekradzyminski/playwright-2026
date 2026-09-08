import { expect, type APIResponse } from '@playwright/test';
import { expectJson } from './jsonResponse';
import type { AccountResponse } from '../types/account';

export async function expectAccount(response: APIResponse, status = 200): Promise<AccountResponse> {
  const body = await expectJson<AccountResponse>(response, status);
  expect(body).toMatchObject({
    id: expect.any(Number),
    username: expect.any(String),
    email: expect.any(String),
    roles: expect.arrayContaining([expect.any(String)]),
    firstName: expect.any(String),
    lastName: expect.any(String)
  });
  expect(body).not.toHaveProperty('password');
  return body;
}

export async function expectAccountList(response: APIResponse, status = 200): Promise<AccountResponse[]> {
  const body = await expectJson<AccountResponse[]>(response, status);
  expect(body).toEqual(expect.arrayContaining([
    expect.objectContaining({
      id: expect.any(Number),
      username: expect.any(String),
      email: expect.any(String),
      roles: expect.any(Array),
      firstName: expect.any(String),
      lastName: expect.any(String)
    })
  ]));
  return body;
}
