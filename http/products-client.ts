import type { APIRequestContext } from '@playwright/test';
import type { ProductCreateDto, ProductUpdateDto } from '../types/product';

export const PRODUCTS_ENDPOINT = '/api/v1/products';

export class ProductsClient {
  constructor(private readonly request: APIRequestContext, private readonly token?: string) {}

  getAll() {
    return this.request.get(PRODUCTS_ENDPOINT, { headers: this.authHeaders() });
  }

  getById(id: number | string) {
    return this.request.get(this.productPath(id), { headers: this.authHeaders() });
  }

  create(product: ProductCreateDto) {
    return this.request.post(PRODUCTS_ENDPOINT, {
      data: product,
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
    });
  }

  update(id: number | string, product: ProductUpdateDto) {
    return this.request.put(this.productPath(id), {
      data: product,
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
    });
  }

  delete(id: number | string) {
    return this.request.delete(this.productPath(id), { headers: this.authHeaders() });
  }

  private productPath(id: number | string): string {
    return `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`;
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
