import type { APIRequestContext } from '@playwright/test';
import type { TrafficLogsQuery } from '../types/traffic';

export const TRAFFIC_INFO_ENDPOINT = '/api/v1/traffic/info';
export const TRAFFIC_LOGS_ENDPOINT = '/api/v1/traffic/logs';

type RequestOptions = Pick<NonNullable<Parameters<APIRequestContext['get']>[1]>, 'headers'>;

export class TrafficClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
    private readonly clientSessionId?: string,
  ) {}

  private headers(): Record<string, string> {
    return {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.clientSessionId ? { 'X-Client-Session-Id': this.clientSessionId } : {}),
    };
  }

  getInfo(options?: RequestOptions) {
    return this.request.get(TRAFFIC_INFO_ENDPOINT, { headers: { ...this.headers(), ...options?.headers } });
  }

  getLogs(query: TrafficLogsQuery = {}, options?: RequestOptions) {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean>;
    return this.request.get(TRAFFIC_LOGS_ENDPOINT, {
      params,
      headers: { ...this.headers(), ...options?.headers },
    });
  }

  getLog(correlationId: string, options?: RequestOptions) {
    return this.request.get(`${TRAFFIC_LOGS_ENDPOINT}/${encodeURIComponent(correlationId)}`, {
      headers: { ...this.headers(), ...options?.headers },
    });
  }
}
