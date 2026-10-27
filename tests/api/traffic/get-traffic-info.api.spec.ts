import { randomUUID } from 'node:crypto';
import { TrafficClient } from '../../../http/traffic-client';
import { test, expect } from '../fixtures';
import { expectTrafficInfo } from './traffic-assertions';

test.describe('GET /api/v1/traffic/info', () => {
  test('returns session-specific WebSocket connection information - 200', async ({ traffic }) => {
    // when
    const response = await traffic.client.getInfo();

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expectTrafficInfo(await response.json(), traffic.sessionId);
  });

  test('rejects a missing session header - 400', async ({ traffic }) => {
    // given
    const client = traffic.forSession();

    // when
    const response = await client.getInfo();

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'A valid X-Client-Session-Id header is required' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // given
    const client = new TrafficClient(request, undefined, randomUUID());

    // when
    const response = await client.getInfo();

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });
});
