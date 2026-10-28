import { randomUUID } from 'node:crypto';
import { expect, type APIRequestContext, type BrowserContext } from '@playwright/test';
import { test as base } from '../fixtures';
import { CartClient } from '../../../http/cart-client';
import { OrdersClient } from '../../../http/orders-client';
import type { ApiTestContext } from '../../api/support/api-test-context';
import { expectCart, type ExpectedCartItem } from '../../api/cart/cart-test-context';
import { shippingAddress } from '../../api/graphql/graphql-test-context';
import { AdminInventoryPage } from '../../../pages/admin/admin-inventory.page';
import { AdminOrdersPage } from '../../../pages/admin/admin-orders.page';
import { AdminProductFormPage } from '../../../pages/admin/admin-product-form.page';
import { AdminProductsPage } from '../../../pages/admin/admin-products.page';
import { CartPage } from '../../../pages/cart.page';
import { CheckoutPage } from '../../../pages/checkout.page';
import { OrderDetailsPage } from '../../../pages/order-details.page';
import { ProductDetailsPage } from '../../../pages/product-details.page';
import { ProfilePage } from '../../../pages/profile.page';
import { CommerceTransportSelector } from '../../../pages/components/commerce-transport.component';
import { DesktopLoggedInHeader } from '../../../pages/components/desktop-logged-in-header.component';
import type { OrderDto, OrderPageDto } from '../../../types/order';
import type { ProductCreateDto, ProductDto } from '../../../types/product';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../../test-config';
import { observeCommerceTraffic, type CommerceTraffic } from './graphql-network';

export { shippingAddress };

// REST clients for one identity: setup and independent verification, never the action under test.
export interface Shopper {
  username: string;
  cart: CartClient;
  orders: OrdersClient;
}

export class Shop {
  constructor(
    private readonly api: ApiTestContext,
    private readonly request: APIRequestContext,
    readonly signedIn: Shopper,
  ) {}

  createProduct(overrides: Partial<ProductCreateDto> = {}): Promise<ProductDto> {
    const suffix = randomUUID();
    return this.api.createProduct({
      name: `GraphQL shop ${suffix}`, category: `GraphQL shop ${suffix}`, description: 'Disposable GraphQL storefront product',
      price: 12.5, stockQuantity: 8, imageUrl: '', ...overrides,
    });
  }

  // The storefront reads the catalog in pages of 25; a margin keeps the product off the first page
  // while parallel tests add or remove products.
  async createProductBeyondFirstCatalogPage(overrides: Partial<ProductCreateDto> = {}): Promise<ProductDto> {
    for (let size = await this.catalogSize(); size < 35; size++) await this.createProduct();
    return this.createProduct(overrides);
  }

  async createCustomer(): Promise<Shopper> {
    const { user, token } = await this.api.createUser();
    return shopper(this.request, user.username, token);
  }

  async addToCart(product: ProductDto, quantity: number, customer = this.signedIn): Promise<void> {
    const response = await customer.cart.addItem({ productId: product.id, quantity });
    expect(response.status(), `Adding product ${product.id} to the cart of ${customer.username}`).toBe(200);
  }

  async placeOrder(product: ProductDto, quantity: number, customer = this.signedIn): Promise<OrderDto> {
    await this.addToCart(product, quantity, customer);
    const response = await customer.orders.create(shippingAddress);
    expect(response.status(), `Order of ${customer.username}`).toBe(201);
    return response.json();
  }

  // Track products created through the UI before asserting on them, so cleanup still runs.
  async trackProductNamed(name: string): Promise<ProductDto> {
    const product = (await this.allProducts()).find(candidate => candidate.name === name);
    if (product) this.api.trackProduct(product);
    expect(product, `Saved product named ${name}`).toBeDefined();
    return product!;
  }

  forgetProduct(product: ProductDto): void {
    this.api.forgetProduct(product.id);
  }

  async catalogSize(): Promise<number> {
    return (await this.allProducts()).length;
  }

  async savedProduct(product: ProductDto): Promise<ProductDto> {
    const response = await (await this.api.adminProducts()).getById(product.id);
    expect(response.status()).toBe(200);
    return response.json();
  }

  async expectDeleted(product: ProductDto): Promise<void> {
    const response = await (await this.api.adminProducts()).getById(product.id);
    expect(response.status(), `Product ${product.id} after deletion`).toBe(404);
  }

  async expectStock(product: ProductDto, quantity: number): Promise<void> {
    expect((await this.savedProduct(product)).stockQuantity, `Stock of ${product.name}`).toBe(quantity);
  }

  async expectSavedCart(items: ExpectedCartItem[], customer = this.signedIn): Promise<void> {
    const response = await customer.cart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), customer.username, items);
  }

  async expectSavedOrder(id: number | string, expected: Partial<OrderDto>, customer = this.signedIn): Promise<void> {
    const response = await customer.orders.getById(id);
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject(expected);
  }

  async expectOrderCount(count: number, customer = this.signedIn): Promise<void> {
    const response = await customer.orders.getMine();
    expect(response.status()).toBe(200);
    expect((await response.json() as OrderPageDto).totalElements, `Orders of ${customer.username}`).toBe(count);
  }

  private async allProducts(): Promise<ProductDto[]> {
    const response = await (await this.api.adminProducts()).getAll();
    expect(response.status()).toBe(200);
    return response.json();
  }
}

function shopper(request: APIRequestContext, username: string, token: string): Shopper {
  return { username, cart: new CartClient(request, token), orders: new OrdersClient(request, token) };
}

async function accessToken(context: BrowserContext): Promise<string> {
  const state = await context.storageState();
  const token = state.origins.flatMap(origin => origin.localStorage).find(item => item.name === 'token')?.value;
  if (!token) throw new Error('The authenticated UI context must contain an access token');
  return token;
}

export const test = base.extend<{
  shop: Shop;
  commerceTraffic: CommerceTraffic;
  shopApi: CommerceTransportSelector;
  header: DesktopLoggedInHeader;
  cartPage: CartPage;
  productDetails: ProductDetailsPage;
  checkout: CheckoutPage;
  orderDetails: OrderDetailsPage;
  profile: ProfilePage;
}>({
  commerceTransport: 'graphql',
  shop: async ({ api, request, context, loginCredentials }, use) => {
    await use(new Shop(api, request, shopper(request, loginCredentials.username, await accessToken(context))));
  },
  // Requested before navigation, so it sees every request of the test.
  commerceTraffic: async ({ page }, use) => { await use(observeCommerceTraffic(page)); },
  shopApi: async ({ page }, use) => { await use(new CommerceTransportSelector(page)); },
  header: async ({ page }, use) => { await use(new DesktopLoggedInHeader(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  productDetails: async ({ page }, use) => { await use(new ProductDetailsPage(page)); },
  checkout: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  orderDetails: async ({ page }, use) => { await use(new OrderDetailsPage(page)); },
  profile: async ({ page }, use) => { await use(new ProfilePage(page)); },
});

// Shared administrator in GraphQL mode. It may change only entities the test owns (products it creates,
// orders of disposable customers); never edit, delete or log out the administrator account itself.
export const adminCommerceTest = test.extend<{
  adminProducts: AdminProductsPage;
  productForm: AdminProductFormPage;
  adminOrders: AdminOrdersPage;
  inventory: AdminInventoryPage;
}>({
  loginCredentials: async ({}, use) => {
    await use({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  },
  adminProducts: async ({ page }, use) => { await use(new AdminProductsPage(page)); },
  productForm: async ({ page }, use) => { await use(new AdminProductFormPage(page)); },
  adminOrders: async ({ page }, use) => { await use(new AdminOrdersPage(page)); },
  inventory: async ({ page }, use) => { await use(new AdminInventoryPage(page)); },
});

export { expect };
