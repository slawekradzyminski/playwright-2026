import { randomUUID } from 'node:crypto';
import { TrafficClient } from '../../../http/traffic-client';
import { test, expect } from '../fixtures';
import { expectCapturedInfo, trafficSummary } from './traffic-assertions';

test.describe('GET /api/v1/traffic/logs/{correlationId}', () => {
  test('returns a captured record to its client session - 200', async ({ traffic }) => {
    // given
    const captured = await traffic.captureInfo();

    // when
    const response = await traffic.client.getLog(captured.correlationId);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expectCapturedInfo(trafficSummary(await response.json()), traffic.sessionId, captured.correlationId);
  });

  test('rejects a missing session header - 400', async ({ traffic }) => {
    // given
    const client = traffic.forSession();

    // when
    const response = await client.getLog(randomUUID());

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'A valid X-Client-Session-Id header is required' });
  });

  test('requires authentication - 401', async ({ request }) => {
    // given
    const client = new TrafficClient(request, undefined, randomUUID());

    // when
    const response = await client.getLog(randomUUID());

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('hides a record belonging to a different session - 404', async ({ traffic }) => {
    // given
    const captured = await traffic.captureInfo();
    const client = traffic.forSession(randomUUID());

    // when
    const response = await client.getLog(captured.correlationId);

    // then
    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('');
  });

  test('reports an unknown correlation ID - 404', async ({ traffic }) => {
    // when
    const response = await traffic.client.getLog(randomUUID());

    // then
    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('');
  });
});
