import { expect, type APIRequestContext } from '@playwright/test';
import { ProductClient } from '../http/productClient';
import { generateProduct } from '../generators/productGenerator';
import { expectValidProduct } from '../validators/productResponse';
import type { ProductCreateDto, ProductDto } from '../types/product';

export class ProductFactory {
  private readonly ids = new Set<number>();
  private readonly client: ProductClient;

  constructor(request: APIRequestContext, private readonly adminToken: string) {
    this.client = new ProductClient(request);
  }

  track(id: number): void {
    this.ids.add(id);
  }

  async create(overrides: Partial<ProductCreateDto> = {}): Promise<ProductDto> {
    const response = await this.client.createProduct(generateProduct(overrides), this.adminToken);
    const product = await response.json() as ProductDto;
    // Register ownership before assertions, including unexpected successful responses.
    if (Number.isInteger(product.id)) this.track(product.id);
    expect(response.status(), 'Create setup product').toBe(201);
    expectValidProduct(product);
    return product;
  }

  async cleanup(): Promise<void> {
    const results = await Promise.allSettled([...this.ids].map(async id => {
      const response = await this.client.deleteProduct(id, this.adminToken);
      expect([204, 404], `Cleanup product ${id}`).toContain(response.status());
    }));
    const errors = results.flatMap(result => result.status === 'rejected' ? [result.reason] : []);
    if (errors.length) throw new AggregateError(errors, 'Failed to clean up owned products');
  }
}
