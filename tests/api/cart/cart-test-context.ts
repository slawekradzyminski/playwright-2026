import { expect, type APIRequestContext } from '@playwright/test';
import { generateProduct } from '../../../generators/product-generator';
import { generateUser } from '../../../generators/user-generator';
import { AuthClient } from '../../../http/auth-client';
import { CartClient } from '../../../http/cart-client';
import { ProductsClient } from '../../../http/products-client';
import { UsersClient } from '../../../http/users-client';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../../test-config';
import type { CartDto } from '../../../types/cart';
import type { ProductCreateDto, ProductDto } from '../../../types/product';
import type { UserRegisterDto } from '../../../types/user';

// Each test gets its own client user and products, so cart tests are independent.
export class CartTestContext {
  private readonly createdProductIds: number[] = [];

  private constructor(
    private readonly request: APIRequestContext,
    private readonly adminToken: string,
    readonly user: UserRegisterDto,
    readonly cartClient: CartClient,
  ) {}

  static async create(request: APIRequestContext): Promise<CartTestContext> {
    const authClient = new AuthClient(request);
    const adminToken = await login(authClient, ADMIN_USERNAME, ADMIN_PASSWORD);

    const user = generateUser();
    const registered = await new UsersClient(request).register(user);
    expect(registered.status(), 'Registration of the cart user').toBe(201);
    const userToken = await login(authClient, user.username, user.password);

    return new CartTestContext(request, adminToken, user, new CartClient(request, userToken));
  }

  async createProduct(product: ProductCreateDto = generateProduct()): Promise<ProductDto> {
    const response = await new ProductsClient(this.request).create(product, this.adminToken);
    expect(response.status(), 'Creation of a test product').toBe(201);
    const created: ProductDto = await response.json();
    this.createdProductIds.push(created.id);
    return created;
  }

  async addToCart(product: ProductDto, quantity: number): Promise<void> {
    const response = await this.cartClient.addItem({ productId: product.id, quantity });
    expect(response.status(), `Adding product ${product.id} to the cart`).toBe(200);
  }

  // Deleting the user removes their cart, which must happen before its products can be deleted.
  async cleanup(): Promise<void> {
    const deletedUser = await new UsersClient(this.request).delete(this.user.username, this.adminToken);
    expect(deletedUser.status(), `Cleanup of ${this.user.username}`).toBe(204);

    const productsClient = new ProductsClient(this.request);
    for (const id of this.createdProductIds) {
      const deletedProduct = await productsClient.delete(id, this.adminToken);
      expect(deletedProduct.status(), `Cleanup of product ${id}`).toBe(204);
    }
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

async function login(authClient: AuthClient, username: string, password: string): Promise<string> {
  const response = await authClient.login({ username, password });
  expect(response.status(), `Login of ${username}`).toBe(200);
  const { token } = await response.json();
  expect(token).toEqual(expect.any(String));
  return token;
}
