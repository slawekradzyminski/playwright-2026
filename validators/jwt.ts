import { expect } from '@playwright/test';

const BASE64_URL = /^[A-Za-z0-9_-]+$/;

function decodeJwtSegment(segment: string, name: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(Buffer.from(segment, 'base64url').toString());

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('must be a JSON object');
    }

    return value as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `JWT ${name} is invalid: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function expectValidJwt(token: unknown, fieldName = 'token'): asserts token is string {
  expect(token, `${fieldName} must be a string`).toEqual(expect.any(String));

  if (typeof token !== 'string') {
    return;
  }

  const segments = token.split('.');
  expect(segments, `${fieldName} must be a JWT`).toHaveLength(3);

  for (const [index, segment] of segments.entries()) {
    expect(segment, `${fieldName} segment ${index + 1} must be valid base64url`).toMatch(
      BASE64_URL
    );
  }

  const header = decodeJwtSegment(segments[0], 'header');
  decodeJwtSegment(segments[1], 'payload');

  expect(header.alg, `${fieldName} must specify an algorithm`).toEqual(expect.any(String));
  expect(header.alg).not.toBe('');
}
