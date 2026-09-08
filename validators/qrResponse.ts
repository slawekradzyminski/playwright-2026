import { expect, type APIResponse } from '@playwright/test';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export async function expectValidPngResponse(response: APIResponse): Promise<void> {
  expect(response.headers()['content-type']).toMatch(/^image\/png(?:;|$)/i);

  const body = await response.body();
  expect(body.length).toBeGreaterThan(33);
  expect(body.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE);
  expect(body.subarray(12, 16).toString('ascii')).toBe('IHDR');
  expect(body.readUInt32BE(16)).toBeGreaterThan(0);
  expect(body.readUInt32BE(20)).toBeGreaterThan(0);
  expect(body.subarray(-8, -4).toString('ascii')).toBe('IEND');
}
