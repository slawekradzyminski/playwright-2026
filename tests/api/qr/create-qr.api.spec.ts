import { expect } from '@playwright/test';
import { test } from '../../../fixtures/shared/account';
import { CreateQrClient } from '../../../clients/qr/create-qr-client';
import { unauthorizedCases } from '../test-data/unauthorized-cases';
import type { CreateQrDto } from '../../../types/qr';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function expectPng(responseBody: Buffer): void {
  expect(responseBody.subarray(0, 8)).toEqual(PNG_SIGNATURE);
  expect(responseBody.subarray(12, 16).toString('ascii')).toBe('IHDR');
  expect(responseBody.readUInt32BE(16)).toBe(400);
  expect(responseBody.readUInt32BE(20)).toBe(400);
  expect(responseBody.subarray(-8, -4).toString('ascii')).toBe('IEND');
}

test.describe('POST /api/v1/qr/create', () => {
  let client: CreateQrClient;

  test.beforeEach(async ({ request }) => {
    // given
    client = new CreateQrClient(request);
  });

  const validCases: Array<{ name: string; payload: CreateQrDto }> = [
    { name: 'ASCII text', payload: { text: 'Training QR' } },
    { name: 'multiline ASCII text', payload: { text: 'Training QR\nSecond line' } },
  ];

  for (const { name, payload } of validCases) {
    test(`should generate a PNG for ${name} - 200`, async ({ account }) => {
      // given
      const token = account.token;

      // when
      const response = await client.create(payload, token);

      // then
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
      const body = await response.body();
      expect(body.length).toBeGreaterThanOrEqual(45);
      expectPng(body);
    });
  }

  test('should reject blank text - 400', async ({ account }) => {
    // given
    const payload = { text: '   ' };

    // when
    const response = await client.create(payload, account.token);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ text: 'Text is required' });
  });

  test('should reject a missing text property - 400', async ({ account }) => {
    // given
    const payload = {};

    // when
    const response = await client.create(payload, account.token);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ text: 'Text is required' });
  });

  test('should reject unauthorized requests - 401', async ({ account }) => {
    // given
    const payload: CreateQrDto = { text: 'Training QR' };

    for (const { name, token, message } of unauthorizedCases(account.token)) {
      await test.step(name, async () => {
        // when
        const response = await client.create(payload, token);

        // then
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ message });
      });
    }
  });
});
