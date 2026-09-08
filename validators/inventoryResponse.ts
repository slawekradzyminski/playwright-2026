import { expect, type APIResponse } from '@playwright/test';
import { expectJson } from './jsonResponse';
import type { InventoryItemDto, InventoryMovementDto, PageDto, StockStatus } from '../types/inventory';

export function expectValidInventoryItem(value: unknown): asserts value is InventoryItemDto {
  expect(value).toMatchObject({
    productId: expect.any(Number),
    name: expect.any(String),
    category: expect.any(String),
    availableQuantity: expect.any(Number),
    stockStatus: expect.stringMatching(/^(IN_STOCK|LOW_STOCK|OUT_OF_STOCK)$/),
    lastChangedAt: expect.any(String)
  });
  const item = value as InventoryItemDto;
  expect(item.productId).toBeGreaterThan(0);
  expect(item.availableQuantity).toBeGreaterThanOrEqual(0);
  expect(Number.isNaN(Date.parse(item.lastChangedAt))).toBe(false);
}

export function expectValidInventoryPage(value: unknown): asserts value is PageDto<InventoryItemDto> {
  expectPage(value);
  const page = value as PageDto<InventoryItemDto>;
  for (const item of page.content) expectValidInventoryItem(item);
}

export function expectValidMovement(value: unknown): asserts value is InventoryMovementDto {
  expect(value).toMatchObject({
    id: expect.any(Number),
    productId: expect.any(Number),
    type: expect.stringMatching(/^(INITIAL_STOCK|ADMIN_ADJUSTMENT|ORDER_DEDUCTED|ORDER_RESTORED)$/),
    delta: expect.any(Number),
    quantityAfter: expect.any(Number),
    actor: expect.any(String),
    reason: expect.any(String),
    createdAt: expect.any(String)
  });
  const movement = value as InventoryMovementDto;
  expect(movement.id).toBeGreaterThan(0);
  expect(movement.quantityAfter).toBeGreaterThanOrEqual(0);
  expect(movement.requestId === null || typeof movement.requestId === 'string').toBe(true);
  expect(Number.isNaN(Date.parse(movement.createdAt))).toBe(false);
}

export function expectValidMovementPage(value: unknown): asserts value is PageDto<InventoryMovementDto> {
  expectPage(value);
  const page = value as PageDto<InventoryMovementDto>;
  for (const movement of page.content) expectValidMovement(movement);
}

export async function expectInventoryItem(response: APIResponse, status: number): Promise<InventoryItemDto> {
  const value = await expectJson<InventoryItemDto>(response, status);
  expectValidInventoryItem(value);
  return value;
}

function expectPage(value: unknown): asserts value is PageDto<unknown> {
  expect(value).toMatchObject({
    content: expect.any(Array),
    pageNumber: expect.any(Number),
    pageSize: expect.any(Number),
    totalElements: expect.any(Number),
    totalPages: expect.any(Number)
  });
}

export function expectStockStatus(value: unknown, expected: StockStatus): void {
  expect(value).toBe(expected);
}
