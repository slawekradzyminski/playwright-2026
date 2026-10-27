import { expect, type APIResponse } from '@playwright/test';

export function expectContentType(response: APIResponse | Response, expected: string): void {
  const header = typeof response.headers === 'function'
    ? response.headers()['content-type']
    : response.headers.get('content-type');
  const mediaType = header?.split(';')[0].trim().toLowerCase();
  expect(mediaType, 'Response content type').toBe(expected);
}
