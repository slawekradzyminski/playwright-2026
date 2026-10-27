import { expect, type APIRequestContext } from '@playwright/test';
import { generateProduct } from '../../../generators/product-generator';
import { CartClient } from '../../../http/cart-client';
import { OrdersClient } from '../../../http/orders-client';
import type { AddressDto, OrderDto, OrderStatus } from '../../../types/order';
import type { ProductCreateDto, ProductDto } from '../../../types/product';
import type { UserRegisterDto } from '../../../types/user';
import type { ApiTestContext } from '../support/api-test-context';
import { expectCart, type ExpectedCartItem } from '../cart/cart-test-context';
import { expectOrder } from './order-assertions';

export const shippingAddress: AddressDto = {
  street: '123 Main St', city: 'Warsaw', state: 'MZ', zipCode: '00-001', country: 'Poland',
};

export class OrderTestContext {
  private constructor(
    private readonly api: ApiTestContext,
    readonly user: UserRegisterDto,
    readonly client: OrdersClient,
    readonly cart: CartClient,
  ) {}

  static async create(request: APIRequestContext, api: ApiTestContext): Promise<OrderTestContext> {
    const { user, token } = await api.createUser();
    return new OrderTestContext(api, user, new OrdersClient(request, token), new CartClient(request, token));
  }

  async fillCart(overrides: Partial<ProductCreateDto> = {}, quantity = 2) {
    const product = await this.api.createProduct({ ...generateProduct(), ...overrides });
    const response = await this.cart.addItem({ productId: product.id, quantity });
    expect(response.status(), 'Add owned product to cart').toBe(200);
    return { product, quantity };
  }

  async placeOrder(overrides: Partial<ProductCreateDto> = {}, quantity = 2) {
    const line = await this.fillCart(overrides, quantity);
    const response = await this.client.create(shippingAddress);
    expect(response.status(), 'Create owned order').toBe(201);
    const order: OrderDto = await response.json();
    expectOrder(order, this.user.username, line.product, quantity, shippingAddress);
    return { ...line, order };
  }

  async expectCart(items: ExpectedCartItem[]): Promise<void> {
    const response = await this.cart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), this.user.username, items);
  }

  async expectStock(product: ProductDto, quantity: number): Promise<void> {
    const response = await (await this.api.adminProducts()).getById(product.id);
    expect(response.status()).toBe(200);
    expect((await response.json()).stockQuantity).toBe(quantity);
  }

  async expectStored(order: OrderDto, status: OrderStatus): Promise<void> {
    const response = await this.client.getById(order.id);
    expect(response.status()).toBe(200);
    const stored: OrderDto = await response.json();
    expect(stored).toMatchObject({ ...order, status, updatedAt: expect.any(String) });
  }
}
