import { expect, type APIRequestContext } from '@playwright/test';
import { CartClient } from '../http/cartClient';
import { OrderClient } from '../http/orderClient';
import type { ProductDto } from '../types/product';
import type { OrderDto } from '../types/order';
import type { LoggedInUser } from './accountFactory';
import { expectOrder } from '../validators/orderResponse';

export const shippingAddress = { street: 'Test Street', city: 'Warsaw', state: 'Mazovia', zipCode: '00-001', country: 'PL' };

// Orders belong to disposable accounts; AccountFactory owns their cascade cleanup.
export class OrderFactory {
  private readonly orders: OrderClient;
  private readonly carts: CartClient;

  constructor(
    request: APIRequestContext,
    private readonly owner: LoggedInUser,
    private readonly products: [ProductDto, ProductDto]
  ) {
    this.orders = new OrderClient(request);
    this.carts = new CartClient(request);
  }

  readonly fillCart = async (user = this.owner): Promise<void> => {
    for (const [index, product] of this.products.entries()) {
      expect((await this.carts.addItem({ productId: product.id, quantity: index + 2 }, user.token)).status()).toBe(200);
    }
  };

  readonly create = async (user = this.owner): Promise<OrderDto> => {
    await this.fillCart(user);
    return expectOrder(await this.orders.create(shippingAddress, user.token), user.user.username, this.products, shippingAddress, 'PENDING', 201);
  };
}
