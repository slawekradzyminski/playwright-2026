import { expect, type APIRequestContext } from '@playwright/test';
import type { ProductCreateDto, ProductDto } from '../types/product';

const PRODUCTS_ENDPOINT = '/api/v1/products';

/** Creating and deleting products requires an admin token. */
export class ProductsApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  async create(product: ProductCreateDto): Promise<ProductDto> {
    const response = await this.request.post(PRODUCTS_ENDPOINT, { data: product, headers: this.headers() });
    expect(response.status()).toBe(201);
    return response.json();
  }

  /** The backend answers 409 while the product is still in a cart or an order. */
  async delete(id: number) {
    const response = await this.request.delete(`${PRODUCTS_ENDPOINT}/${id}`, { headers: this.headers() });
    expect(response.status()).toBe(204);
  }

  private headers() {
    return { Authorization: `Bearer ${this.token}` };
  }
}
