import type { Page, Request, Response } from '@playwright/test';
import { GRAPHQL_ENDPOINT } from '../../../http/graphql-client';

// Every commerce operation shares one URL, so match requests by the operation name in the POST body.
export function operationName(request: Request): string | undefined {
  if (request.method() !== 'POST' || new URL(request.url()).pathname !== GRAPHQL_ENDPOINT) return undefined;
  try {
    return (request.postDataJSON()?.query as string | undefined)?.match(/^\s*(?:query|mutation)\s+(\w+)/)?.[1];
  } catch {
    return undefined;
  }
}

// Start waiting before the action that sends the operation.
export function waitForOperation(page: Page, name: string): Promise<Response> {
  return page.waitForResponse(response => operationName(response.request()) === name);
}

// Start waiting before the action that loads the cart through REST.
export function waitForRestCart(page: Page): Promise<Response> {
  return page.waitForResponse(response => new URL(response.url()).pathname === '/api/v1/cart');
}

// REST commerce routes the GraphQL storefront must not fall back to. Identity and refresh stay REST.
const REST_COMMERCE = /^\/api\/v1\/(products|cart|orders|admin\/inventory)(\/|$)/;

export interface CommerceTraffic {
  operations: string[];
  restCommerceRequests: string[];
  tokenRefreshes: number;
}

// Attach before navigation to observe which transport the page uses.
export function observeCommerceTraffic(page: Page): CommerceTraffic {
  const traffic: CommerceTraffic = { operations: [], restCommerceRequests: [], tokenRefreshes: 0 };
  page.on('request', request => {
    const name = operationName(request);
    if (name) traffic.operations.push(name);
    const { pathname } = new URL(request.url());
    if (REST_COMMERCE.test(pathname)) traffic.restCommerceRequests.push(`${request.method()} ${pathname}`);
    if (pathname === '/api/v1/users/refresh') traffic.tokenRefreshes++;
  });
  return traffic;
}

// Records the offset of every catalog page the storefront requests.
export function recordCatalogOffsets(page: Page): number[] {
  const offsets: number[] = [];
  page.on('request', request => {
    if (operationName(request) === 'Products') offsets.push(request.postDataJSON().variables.offset);
  });
  return offsets;
}

interface ExecutionError {
  field: string;
  code: 'BAD_REQUEST' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT';
  message: string;
}

// Replies to one named operation with an HTTP 200 execution error; other operations reach the server.
export async function failOperation(page: Page, name: string, { field, code, message }: ExecutionError): Promise<void> {
  await page.route(`**${GRAPHQL_ENDPOINT}`, route => operationName(route.request()) === name
    ? route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ errors: [{ message, path: [field], extensions: { code } }], data: { [field]: null } }),
    })
    : route.fallback());
}

// Replies once to one named operation with HTTP 401, as for an access token that expired before execution.
export async function expireTokenOnce(page: Page, name: string): Promise<void> {
  let expired = false;
  await page.route(`**${GRAPHQL_ENDPOINT}`, route => {
    if (expired || operationName(route.request()) !== name) return route.fallback();
    expired = true;
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid or expired token' }) });
  });
}

// Holds one named operation until released; the held request then reaches the real server.
export async function holdOperation(page: Page, name: string): Promise<() => void> {
  let release!: () => void;
  const released = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**${GRAPHQL_ENDPOINT}`, async route => {
    if (operationName(route.request()) === name) await released;
    await route.fallback();
  });
  return release;
}

// Lets one named operation reach the server, then drops the response, as on a lost connection.
export async function loseResponse(page: Page, name: string): Promise<void> {
  await page.route(`**${GRAPHQL_ENDPOINT}`, async route => {
    if (operationName(route.request()) !== name) return route.fallback();
    await route.fetch();
    await route.abort('connectionreset');
  });
}
