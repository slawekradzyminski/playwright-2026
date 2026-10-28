import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { generateProduct } from '../../../generators/product-generator';
import { GraphQlClient } from '../../../http/graphql-client';
import type { GqlCart, GqlOrder, GqlProductInput, GqlProductPage, GraphQlResponse } from '../../../types/graphql';
import type { AddressDto } from '../../../types/order';
import type { ProductCreateDto, ProductDto } from '../../../types/product';
import type { UserRegisterDto } from '../../../types/user';
import type { ApiTestContext } from '../support/api-test-context';
import { cents, expectData, money } from './graphql-assertions';
import { ADD_CART_ITEM, CHECKOUT } from './mutations';
import { CART, ORDER, PRODUCTS } from './queries';

export const shippingAddress: AddressDto = {
  street: '123 Main St', city: 'Warsaw', state: 'MZ', zipCode: '00-001', country: 'Poland',
};

export interface Customer {
  user: UserRegisterDto;
  token: string;
  client: GraphQlClient;
}

export interface ExpectedLine {
  product: ProductDto;
  quantity: number;
}

// Disposable customer plus owned products; setup may use REST, the actions under test use GraphQL.
export class GraphQlTestContext {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly api: ApiTestContext,
    readonly customer: Customer,
  ) {}

  static async create(request: APIRequestContext, api: ApiTestContext): Promise<GraphQlTestContext> {
    return new GraphQlTestContext(request, api, await registerCustomer(request, api));
  }

  get client(): GraphQlClient {
    return this.customer.client;
  }

  createCustomer(): Promise<Customer> {
    return registerCustomer(this.request, this.api);
  }

  createProduct(overrides: Partial<ProductCreateDto> = {}): Promise<ProductDto> {
    return this.api.createProduct({ ...generateProduct(), ...overrides });
  }

  // Register a product created through GraphQL before the response is asserted.
  async trackCreatedProduct(response: APIResponse): Promise<void> {
    const body: GraphQlResponse<{ createProduct: { id: string } | null }> = await response.json();
    const created = body.data?.createProduct;
    if (created) this.api.trackProduct(created);
  }

  forgetProduct(product: { id: number | string }): void {
    this.api.forgetProduct(Number(product.id));
  }

  async addToCart(product: ProductDto, quantity: number, client = this.client): Promise<GqlCart> {
    const response = await client.execute(ADD_CART_ITEM, { productId: String(product.id), quantity });
    return (await expectData<{ addCartItem: GqlCart }>(response)).addCartItem;
  }

  async placeOrder(lines: ExpectedLine[], customer = this.customer): Promise<GqlOrder> {
    for (const { product, quantity } of lines) await this.addToCart(product, quantity, customer.client);
    const response = await customer.client.execute(CHECKOUT, { address: shippingAddress });
    return (await expectData<{ checkout: GqlOrder }>(response)).checkout;
  }

  async expectSavedCart(lines: ExpectedLine[], customer = this.customer): Promise<void> {
    const response = await customer.client.execute(CART);
    expectCart((await expectData<{ cart: GqlCart }>(response)).cart, customer.user.username, lines);
  }

  // Independent REST reads, so GraphQL is not its own oracle for saved products and stock.
  async savedProduct(id: number | string): Promise<ProductDto> {
    const response = await (await this.api.adminProducts()).getById(id);
    expect(response.status(), `REST read of product ${id}`).toBe(200);
    return response.json();
  }

  async expectProductDeleted(id: number | string): Promise<void> {
    const response = await (await this.api.adminProducts()).getById(id);
    expect(response.status(), `REST read of deleted product ${id}`).toBe(404);
  }

  async expectStock(product: ProductDto, quantity: number): Promise<void> {
    expect((await this.savedProduct(product.id)).stockQuantity, `Stock of product ${product.id}`).toBe(quantity);
  }

  async expectCategorySize(category: string, total: number): Promise<void> {
    const response = await this.client.execute(PRODUCTS, { offset: 0, limit: 1, category });
    expect((await expectData<{ products: GqlProductPage }>(response)).products.total, `Products in ${category}`).toBe(total);
  }

  async expectOrderStatus(order: GqlOrder, status: GqlOrder['status'], customer = this.customer): Promise<void> {
    const response = await customer.client.execute(ORDER, { id: order.id });
    expect((await expectData<{ order: GqlOrder }>(response)).order.status, `Status of order ${order.id}`).toBe(status);
  }
}

export function productInput(product: ProductCreateDto = generateProduct()): GqlProductInput {
  return { ...product, price: money(product.price) };
}

async function registerCustomer(request: APIRequestContext, api: ApiTestContext): Promise<Customer> {
  const { user, token } = await api.createUser();
  return { user, token, client: new GraphQlClient(request, token) };
}

export function lineTotal({ product, quantity }: ExpectedLine): number {
  return cents(product.price) * quantity;
}

export function expectCart(cart: GqlCart, username: string, lines: ExpectedLine[]): void {
  const byId = (a: { id: string }, b: { id: string }) => Number(a.id) - Number(b.id);
  expect(cart.username).toBe(username);
  expect(cart.totalItems).toBe(lines.reduce((sum, { quantity }) => sum + quantity, 0));
  expect(cents(cart.totalPrice)).toBe(lines.reduce((sum, line) => sum + lineTotal(line), 0));
  expect(cart.items.map(item => ({ id: item.product.id, name: item.product.name, quantity: item.quantity, unitPrice: cents(item.unitPrice) })).sort(byId))
    .toEqual(lines.map(({ product, quantity }) => ({ id: String(product.id), name: product.name, quantity, unitPrice: cents(product.price) })).sort(byId));
}

export function expectOrder(order: GqlOrder, username: string, lines: ExpectedLine[], status = 'PENDING'): void {
  const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
  expect(order).toMatchObject({
    id: expect.stringMatching(/^[1-9]\d*$/), username, status, shippingAddress,
    createdAt: expect.stringMatching(localDateTime), updatedAt: expect.stringMatching(localDateTime),
  });
  expect(cents(order.totalAmount)).toBe(lines.reduce((sum, line) => sum + lineTotal(line), 0));
  expect(order.items.map(item => ({
    productId: item.productId, productName: item.productName, quantity: item.quantity,
    unitPrice: cents(item.unitPrice), totalPrice: cents(item.totalPrice),
  }))).toEqual(expect.arrayContaining(lines.map(line => ({
    productId: String(line.product.id), productName: line.product.name, quantity: line.quantity,
    unitPrice: cents(line.product.price), totalPrice: lineTotal(line),
  }))));
  expect(order.items).toHaveLength(lines.length);
}
