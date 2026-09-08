import { test, expect } from '../../fixtures/loggedInAdmin.fixture';
import { QrClient } from '../../http/qrClient';
import type { CreateQrDto } from '../../types/qr';
import { expectValidPngResponse } from '../../validators/qrResponse';

type InvalidQrCase = {
  label: string;
  payload: Partial<CreateQrDto>;
};

const invalidQrCases: InvalidQrCase[] = [
  {
    label: 'blank text',
    payload: { text: '' }
  },
  {
    label: 'missing text',
    payload: {}
  }
];

test.describe('/api/v1/qr/create API tests', () => {
  let qrClient: QrClient;

  test.beforeEach(({ request }) => {
    qrClient = new QrClient(request);
  });

  test('200 - customer can generate a PNG QR code (E02)', async ({ loggedInUser }) => {
    // given
    const payload: CreateQrDto = {
      text: 'https://example.test/qr/customer'
    };

    // when
    const response = await qrClient.createQrCode(payload, loggedInUser.token);

    // then
    expect(response.status()).toBe(200);
    await expectValidPngResponse(response);
  });

  // BUG-005: 400 and 401 responses are JSON even though the OpenAPI contract lists image/png.
  // Add JSON content-type assertions here after the documentation/contract issue is fixed.
  for (const invalidQrCase of invalidQrCases) {
    test(`400 - reject ${invalidQrCase.label} (${invalidQrCase.label === 'blank text' ? 'E03a' : 'E03b'})`, async ({ adminToken }) => {
      // given
      const payload = invalidQrCase.payload;

      // when
      const response = await qrClient.createQrCode(payload, adminToken);

      // then
      expect(response.status()).toBe(400);
      await expect(response.json()).resolves.toEqual({ text: 'Text is required' });
    });
  }

  // BUG-005: add the JSON content-type assertion after the OpenAPI contract is fixed.
  test('401 - reject a request without a bearer token (E04)', async () => {
    // given
    const payload: CreateQrDto = {
      text: 'https://example.test/qr/anonymous'
    };

    // when
    const response = await qrClient.createQrCode(payload);

    // then
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized' });
  });
});
