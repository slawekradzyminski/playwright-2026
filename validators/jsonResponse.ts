import { expect, type APIResponse } from '@playwright/test';

export async function expectJson<T = Record<string, unknown>>(response: APIResponse, status: number): Promise<T> {
  expect(response.status()).toBe(status);
  expect(response.headers()['content-type']).toContain('application/json');
  return await response.json() as T;
}

export async function expectError(response: APIResponse, status: number, message: string) {
  expect(await expectJson(response, status)).toEqual({ message });
}
