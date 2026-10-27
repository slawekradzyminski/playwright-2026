import { expect, type APIRequestContext } from '@playwright/test';
import { generateProduct } from '../../../generators/product-generator';
import { generateUser } from '../../../generators/user-generator';
import { AuthClient } from '../../../http/auth-client';
import { OrdersClient } from '../../../http/orders-client';
import { ProductsClient } from '../../../http/products-client';
import { UsersClient } from '../../../http/users-client';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../../test-config';
import type { ProductCreateDto, ProductDto } from '../../../types/product';
import type { UserRegisterDto } from '../../../types/user';

export class ApiTestContext {
  private readonly usernames = new Set<string>();
  private readonly productIds = new Set<number>();
  private adminToken?: Promise<string>;

  constructor(private readonly request: APIRequestContext) {}

  private async login(username: string, password: string): Promise<string> {
    const response = await new AuthClient(this.request).login({ username, password });
    expect(response.status(), `Login of ${username}`).toBe(200);
    const { token } = await response.json();
    expect(token).toEqual(expect.stringMatching(/\S+/));
    return token;
  }

  private getAdminToken(): Promise<string> {
    return this.adminToken ??= this.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  }

  async adminUsers(): Promise<UsersClient> {
    return new UsersClient(this.request, await this.getAdminToken());
  }

  async adminOrders(): Promise<OrdersClient> {
    return new OrdersClient(this.request, await this.getAdminToken());
  }

  async adminProducts(): Promise<ProductsClient> {
    return new ProductsClient(this.request, await this.getAdminToken());
  }

  async registerUser(user: UserRegisterDto, options?: Parameters<UsersClient['register']>[1]) {
    const response = await new UsersClient(this.request).register(user, options);
    if (response.status() === 201) this.usernames.add(user.username);
    return response;
  }

  async createUser() {
    const user = generateUser();
    const response = await this.registerUser(user);
    expect(response.status(), 'Registration of a test user').toBe(201);
    const token = await this.login(user.username, user.password);
    return { user, token };
  }

  forgetUser(username: string): void {
    this.usernames.delete(username);
  }

  trackProduct(product: ProductDto): void {
    this.productIds.add(product.id);
  }

  async createProduct(product: ProductCreateDto = generateProduct()): Promise<ProductDto> {
    const response = await (await this.adminProducts()).create(product);
    expect(response.status(), 'Creation of a test product').toBe(201);
    const created: ProductDto = await response.json();
    this.trackProduct(created);
    return created;
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await (await this.adminProducts()).delete(id);
    expect(response.status(), `Deletion of owned product ${id}`).toBe(204);
    this.forgetProduct(id);
  }

  forgetProduct(id: number): void {
    this.productIds.delete(id);
  }

  async cleanup(): Promise<void> {
    if (this.usernames.size === 0 && this.productIds.size === 0) return;
    const adminToken = await this.getAdminToken();
    const errors: unknown[] = [];
    // Deleting users removes their cart/order references before product deletion.
    for (const username of this.usernames) {
      try {
        const response = await new UsersClient(this.request).delete(username, adminToken);
        expect(response.status(), `Cleanup of user ${username}`).toBe(204);
        this.usernames.delete(username);
      } catch (error) {
        errors.push(error);
      }
    }
    const products = new ProductsClient(this.request, adminToken);
    for (const id of this.productIds) {
      try {
        const response = await products.delete(id);
        expect(response.status(), `Cleanup of product ${id}`).toBe(204);
        this.productIds.delete(id);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw new AggregateError(errors, 'Test resource cleanup failed');
  }
}
