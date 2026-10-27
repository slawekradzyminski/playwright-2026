import { randomUUID } from 'node:crypto';
import { expect, type APIRequestContext } from '@playwright/test';
import { TrafficClient } from '../../../http/traffic-client';
import type { TrafficLogsPageDto } from '../../../types/traffic';
import type { ApiTestContext } from '../support/api-test-context';
import { trafficSummary, type TrafficSummary } from './traffic-assertions';

export class TrafficTestContext {
  readonly sessionId = `traffic-${randomUUID()}`;
  readonly client: TrafficClient;

  private constructor(private readonly request: APIRequestContext, private readonly token: string) {
    this.client = this.forSession(this.sessionId);
  }

  static async create(request: APIRequestContext, api: ApiTestContext): Promise<TrafficTestContext> {
    const { token } = await api.createUser();
    return new TrafficTestContext(request, token);
  }

  forSession(sessionId?: string): TrafficClient {
    return new TrafficClient(this.request, this.token, sessionId);
  }

  async captureInfo(): Promise<TrafficSummary> {
    const response = await this.client.getInfo();
    expect(response.status(), 'Generate an owned traffic record').toBe(200);
    let captured: TrafficSummary | undefined;
    // Capture completes after response handling; wait only for this owned asynchronous record.
    await expect.poll(async () => {
      const logs = await this.client.getLogs({ pathContains: '/traffic/info', method: 'GET', status: 200 });
      expect(logs.status()).toBe(200);
      const page: TrafficLogsPageDto = await logs.json();
      captured = page.content.map(trafficSummary).find(entry =>
        entry.clientSessionId === this.sessionId && entry.path === '/api/v1/traffic/info');
      return captured;
    }, { timeout: 5000, intervals: [50, 100, 250] }).toBeDefined();
    return captured!;
  }
}
