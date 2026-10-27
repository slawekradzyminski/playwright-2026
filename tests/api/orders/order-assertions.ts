import { expect } from '@playwright/test';
import type { AddressDto, OrderDto } from '../../../types/order';
import type { ProductDto } from '../../../types/product';

export function expectOrder(
  order: OrderDto, username: string, product: ProductDto, quantity: number, address: AddressDto,
): void {
  const total = Math.round(product.price * 100) * quantity / 100;
  expect(order).toMatchObject({
    id: expect.any(Number), username, status: 'PENDING', totalAmount: total,
    shippingAddress: address, createdAt: expect.any(String), updatedAt: expect.any(String),
  });
  expect(order.items).toEqual([{
    id: expect.any(Number), productId: product.id, productName: product.name,
    quantity, unitPrice: product.price, totalPrice: total,
  }]);
}
