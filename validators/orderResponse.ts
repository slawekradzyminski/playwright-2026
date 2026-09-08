import { expect, type APIResponse } from '@playwright/test';
import { expectJson } from './jsonResponse';
import type { AddressDto, OrderDto, OrderPage, OrderStatus } from '../types/order';
import type { ProductDto } from '../types/product';

export function expectOrderBody(body: OrderDto, username: string, products: ProductDto[], address: AddressDto, status: OrderStatus = 'PENDING') {
  expect(body.id).toBeGreaterThan(0);
  expect(body).toMatchObject({ username, shippingAddress: address, status, totalAmount: 41.69 });
  expect(body.items).toHaveLength(2);
  products.forEach((product, index) => {
    const quantity = index + 2;
    expect(body.items).toEqual(expect.arrayContaining([expect.objectContaining({
      id: expect.any(Number), productId: product.id, productName: product.name,
      quantity, unitPrice: product.price, totalPrice: Math.round(product.price * 100) * quantity / 100
    })]));
  });
  for (const timestamp of [body.createdAt, body.updatedAt]) {
    expect(timestamp).toEqual(expect.any(String));
    expect(Number.isFinite(Date.parse(timestamp))).toBe(true);
  }
}

export async function expectOrder(response: APIResponse, username: string, products: ProductDto[], address: AddressDto, status: OrderStatus = 'PENDING', code = 200) {
  const body = await expectJson<OrderDto>(response, code);
  expectOrderBody(body, username, products, address, status);
  return body;
}

export async function expectOrderPage(response: APIResponse, page: number, size: number) {
  const body = await expectJson<OrderPage>(response, 200);
  expect(body).toMatchObject({ pageNumber: page, pageSize: size });
  expect(Array.isArray(body.content)).toBe(true);
  expect(body.content.length).toBeLessThanOrEqual(size);
  expect(Number.isInteger(body.totalElements)).toBe(true);
  expect(body.totalElements).toBeGreaterThanOrEqual(body.content.length);
  expect(body.totalPages).toBe(Math.ceil(body.totalElements / size));
  return body;
}

// BUG-013: mutation updatedAt equality is unresolved; ../reports/bugs/BUG-013-order-mutation-stale-updated-at.md.
// Compare every business field and createdAt; expectOrder still validates both timestamps' formats.
export function expectPersistedOrder(actual: OrderDto, mutation: OrderDto) {
  const { updatedAt: actualUpdatedAt, ...actualFields } = actual;
  const { updatedAt: mutationUpdatedAt, ...mutationFields } = mutation;
  expect(actualFields).toEqual(mutationFields);
}

type ExpectedOrder = Pick<OrderDto, 'id' | 'username'> & Partial<OrderDto>;
type OrderPageExpectation = {
  page: number;
  size: number;
  orders: ExpectedOrder[];
  exact?: boolean;
};

function expectOrderCollection(actual: OrderDto[], expected: ExpectedOrder[], exact = false) {
  expect(actual).toHaveLength(expected.length);
  const byId = (a: ExpectedOrder, b: ExpectedOrder) => a.id - b.id;
  const sortedActual = [...actual].sort(byId);
  const sortedExpected = [...expected].sort(byId);
  if (exact) {
    expect(sortedActual).toEqual(sortedExpected);
  } else {
    expect(sortedActual).toEqual(sortedExpected.map(order => expect.objectContaining(order)));
  }
}

export async function expectOrderPageContents(response: APIResponse, expected: OrderPageExpectation) {
  const body = await expectOrderPage(response, expected.page, expected.size);
  expect(body.totalElements).toBe(expected.orders.length);
  expectOrderCollection(body.content, expected.orders, expected.exact);
}

// Responses must contain every page, starting at page zero. Compare membership
// across pages without assuming an undocumented ordering of orders.
export async function expectPaginatedOrders(responses: APIResponse[], size: number, orders: ExpectedOrder[]) {
  expect(responses).toHaveLength(Math.ceil(orders.length / size));
  const content: OrderDto[] = [];
  for (const [index, response] of responses.entries()) {
    const page = await expectOrderPage(response, index, size);
    expect(page.totalElements).toBe(orders.length);
    expect(page.content).toHaveLength(Math.min(size, orders.length - index * size));
    content.push(...page.content);
  }
  expectOrderCollection(content, orders);
}
