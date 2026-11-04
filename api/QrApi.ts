import { expect, type APIRequestContext } from '@playwright/test';
import type { CreateQrDto } from '../types/qr';

const QR_ENDPOINT = '/api/v1/qr/create';

export class QrApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  /** Returns the PNG the generator produces for the text; generation is deterministic. */
  async create(qr: CreateQrDto): Promise<Buffer> {
    const response = await this.request.post(QR_ENDPOINT, { data: qr, headers: { Authorization: `Bearer ${this.token}` } });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
    return response.body();
  }
}
