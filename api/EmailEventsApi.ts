import { expect, type APIRequestContext } from '@playwright/test';
import type { EmailEvent } from '../types/email';

/** Events belonging to the user whose token was supplied. */
export class EmailEventsApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  async get(): Promise<EmailEvent[]> {
    const response = await this.request.get('/api/v1/users/me/email-events', {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    expect(response.status()).toBe(200);
    return response.json();
  }
}
