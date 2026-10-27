import { randomUUID } from 'node:crypto';
import { TrafficClient } from '../../../http/traffic-client';
import { test, expect } from '../fixtures';
import { expectTrafficPage } from './traffic-assertions';

test.describe('GET /api/v1/traffic/logs', () => {
  test('returns captured records only for the requested session - 200', async ({ traffic }) => {
    // given
    await traffic.captureInfo();
    expect((await traffic.forSession(randomUUID()).getInfo()).status()).toBe(200);

    // when
    const response = await traffic.client.getLogs({ page: 0, size: 10 });

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expectTrafficPage(await response.json(), traffic.sessionId);
  });

  test('rejects an invalid timestamp filter - 400', async ({ traffic }) => {
    // when
    const response = await traffic.client.getLogs({ from: 'not-an-instant' });

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid instant format: not-an-instant' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // given
    const client = new TrafficClient(request, undefined, randomUUID());

    // when
    const response = await client.getLogs();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
