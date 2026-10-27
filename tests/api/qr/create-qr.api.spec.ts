import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { QrClient } from '../../../http/qr-client';
import { test, expect } from '../fixtures';

test.describe('POST /api/v1/qr/create', () => {
  test('generates a QR code containing the supplied text - 200', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    const payload = { text: 'https://example.com/qr-test' };
    const qrclient = new QrClient(request, token);

    // when
    const response = await qrclient.create(payload);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^image\/png\b/);
    const image = PNG.sync.read(await response.body());
    const decoded = jsQR(new Uint8ClampedArray(image.data), image.width, image.height);
    expect(decoded?.data).toBe(payload.text);
  });

  test('rejects blank text - 400', async ({ api, request }) => {
    // given
    const { token } = await api.createUser();
    const qrclient = new QrClient(request, token);

    // when
    const response = await qrclient.create({ text: '' });

    // then
    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toMatch(/^application\/json\b/);
    expect(await response.json()).toEqual({ text: 'Text is required' });
  });

  test('rejects a request without a token - 401', async ({ request }) => {
    // given
    const payload = { text: 'https://example.com/qr-test' };
    const qrclient = new QrClient(request);

    // when
    const response = await qrclient.create(payload);

    // then
    expect(response.status()).toBe(401);
    expect(response.headers()['content-type']).toMatch(/^application\/json\b/);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
