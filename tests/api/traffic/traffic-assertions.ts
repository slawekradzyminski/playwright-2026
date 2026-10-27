import { expect } from '@playwright/test';
import type { TrafficInfoDto, TrafficLogEntryDto, TrafficLogsPageDto } from '../../../types/traffic';

// Project before asserting: failure output must never include captured credentials or bodies.
export function trafficSummary(entry: TrafficLogEntryDto) {
  return {
    correlationId: entry.correlationId, clientSessionId: entry.clientSessionId,
    method: entry.method, path: entry.path, status: entry.status,
  };
}

export type TrafficSummary = ReturnType<typeof trafficSummary>;

export function expectTrafficInfo(info: TrafficInfoDto, sessionId: string): void {
  expect({ webSocketEndpoint: info.webSocketEndpoint, topic: info.topic, description: info.description }).toEqual({
    webSocketEndpoint: '/api/v1/ws-traffic', topic: `/topic/traffic/${sessionId}`,
    description: expect.stringContaining('real-time HTTP traffic events'),
  });
}

export function expectCapturedInfo(entry: TrafficSummary, sessionId: string, correlationId?: string): void {
  expect(entry).toEqual({
    correlationId: correlationId ?? expect.stringMatching(/\S+/), clientSessionId: sessionId,
    method: 'GET', path: '/api/v1/traffic/info', status: 200,
  });
}

export function expectTrafficPage(page: TrafficLogsPageDto, sessionId: string): void {
  expect({ pageNumber: page.pageNumber, pageSize: page.pageSize }).toEqual({ pageNumber: 0, pageSize: 10 });
  const entries = page.content.map(trafficSummary);
  expect(entries.map(entry => entry.clientSessionId)).toEqual(entries.map(() => sessionId));
  expect(entries).toContainEqual({
    correlationId: expect.stringMatching(/\S+/), clientSessionId: sessionId,
    method: 'GET', path: '/api/v1/traffic/info', status: 200,
  });
}
