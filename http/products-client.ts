import type { APIRequestContext } from '@playwright/test';
import type { ProductCreateDto } from '../types/product';

export class ProductsClient {
  constructor(private readonly request: APIRequestContext) {}

  create(product: ProductCreateDto, adminToken: string) {
    return this.request.post('/api/v1/products', {
      data: product,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    });
  }

  delete(id: number, adminToken: string) {
    return this.request.delete(`/api/v1/products/${id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }
}
