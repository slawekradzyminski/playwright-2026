import { expect, type APIResponse } from '@playwright/test';
import { expectContentType } from '../support/content-type';
import type { GraphQlErrorCode, GraphQlResponse, GqlProduct } from '../../../types/graphql';
import type { ProductCreateDto, ProductDto } from '../../../types/product';

// Successful execution: HTTP 200, JSON, no errors. Returns the selected data.
export async function expectData<T>(response: APIResponse): Promise<T> {
  expect(response.status(), 'GraphQL HTTP status').toBe(200);
  expectContentType(response, 'application/json');
  const body: GraphQlResponse<T> = await response.json();
  expect(body.errors, 'GraphQL errors').toBeUndefined();
  expect(body.data).toBeTruthy();
  return body.data as T;
}

interface ExpectedFailure {
  field: string;
  code: GraphQlErrorCode;
  message?: string;
}

// Resolver/business failure: HTTP 200, the failed root field is null and the error names it.
export async function expectFieldError<T = Record<string, unknown>>(
  response: APIResponse, { field, code, message }: ExpectedFailure,
): Promise<GraphQlResponse<T>> {
  expect(response.status(), 'GraphQL HTTP status').toBe(200);
  expectContentType(response, 'application/json');
  const body: GraphQlResponse<T> = await response.json();
  expect(body.errors).toEqual([expect.objectContaining({
    path: [field],
    extensions: expect.objectContaining({ code }),
    ...(message && { message }),
  })]);
  expect(body.data as Record<string, unknown>).toHaveProperty(field, null);
  return body;
}

// Document validation failure: rejected before execution, so there is no data at all.
export async function expectValidationError(response: APIResponse, message: string | RegExp): Promise<void> {
  expect(response.status(), 'GraphQL HTTP status').toBe(200);
  const body: GraphQlResponse = await response.json();
  expect(body.data).toBeUndefined();
  expect(body.errors).toEqual([expect.objectContaining({
    message: typeof message === 'string' ? message : expect.stringMatching(message),
    extensions: expect.objectContaining({ classification: 'ValidationError' }),
  })]);
}

// Exact money handling in minor units; GraphQL money is a decimal string, REST money a JSON number.
export function cents(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100);
  expect(value, 'GraphQL money is a plain decimal string').toMatch(/^\d+(\.\d{1,2})?$/);
  const [units, fraction = ''] = value.split('.');
  return Number(units) * 100 + Number(fraction.padEnd(2, '0'));
}

export function money(amount: number): string {
  return (cents(amount) / 100).toFixed(2);
}

export function expectGqlProduct(product: GqlProduct, expected: ProductCreateDto | ProductDto, id?: string | number): void {
  expect(product).toEqual({
    id: id === undefined ? expect.stringMatching(/^[1-9]\d*$/) : String(id),
    name: expected.name,
    description: expected.description,
    price: money(expected.price),
    stockQuantity: expected.stockQuantity,
    category: expected.category,
    imageUrl: expected.imageUrl ?? null,
  });
}
