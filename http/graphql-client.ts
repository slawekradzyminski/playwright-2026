import type { APIRequestContext } from '@playwright/test';
import type { GraphQlRequest } from '../types/graphql';

export const GRAPHQL_ENDPOINT = '/api/v1/graphql';

type PostOptions = NonNullable<Parameters<APIRequestContext['post']>[1]>;

// Returns the raw APIResponse so tests can assert transport, partial data and errors.
// Without a token the client sends unauthenticated requests.
export class GraphQlClient {
  constructor(private readonly request: APIRequestContext, private readonly token?: string) {}

  execute(query: string, variables?: Record<string, unknown>, operationName?: string) {
    const body: GraphQlRequest = { query, ...(variables && { variables }), ...(operationName && { operationName }) };
    return this.post(body);
  }

  // For envelope tests: sends any JSON value or a raw string body unchanged.
  post(data: unknown, headers: Record<string, string> = {}) {
    const options: PostOptions = {
      data: typeof data === 'string' ? data : JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...this.authHeaders(), ...headers },
    };
    return this.request.post(GRAPHQL_ENDPOINT, options);
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
