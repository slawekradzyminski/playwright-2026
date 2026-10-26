import { expect, type APIRequestContext } from '@playwright/test';
import { CartClient } from '../../../http/cart-client';
import type { CartDto } from '../../../types/cart';
import type { ProductCreateDto, ProductDto } from '../../../types/product';
import type { UserRegisterDto } from '../../../types/user';
import type { ApiTestContext } from '../support/api-test-context';

export class CartTestContext {
  private constructor(
    private readonly api: ApiTestContext,
    readonly user: UserRegisterDto,
    readonly cartClient: CartClient,
  ) {}

  static async create(request: APIRequestContext, api: ApiTestContext): Promise<CartTestContext> {
    const { user, token } = await api.createUser();
    return new CartTestContext(api, user, new CartClient(request, token));
  }

  createProduct(product?: ProductCreateDto): Promise<ProductDto> {
    return this.api.createProduct(product);
  }

  async addToCart(product: ProductDto, quantity: number): Promise<void> {
    const response = await this.cartClient.addItem({ productId: product.id, quantity });
    expect(response.status(), `Adding product ${product.id} to the cart`).toBe(200);
  }
}

export interface ExpectedCartItem {
  product: ProductDto;
  quantity: number;
}

export function expectCart(body: CartDto, username: string, expectedItems: ExpectedCartItem[]) {
  const byProductId = (a: { productId: number }, b: { productId: number }) => a.productId - b.productId;
  const totalCents = expectedItems.reduce(
    (sum, { product, quantity }) => sum + Math.round(product.price * 100) * quantity,
    0,
  );

  expect(body.username).toBe(username);
  expect([...body.items].sort(byProductId)).toEqual(
    expectedItems.map(({ product, quantity }) => ({ productId: product.id, quantity })).sort(byProductId),
  );
  expect(body.totalItems).toBe(expectedItems.reduce((sum, { quantity }) => sum + quantity, 0));
  expect(body.totalPrice).toBeCloseTo(totalCents / 100, 2);
}
