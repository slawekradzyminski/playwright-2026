import { expect } from '@playwright/test';
import { ProductClient } from '../../../http/productClient';
import type { ProductDto } from '../../../types/product';
import { expectJson } from '../../../validators/jsonResponse';

export async function expectStocks(client: ProductClient, products: ProductDto[], token: string, quantities: number[]) {
  for (const [index, product] of products.entries()) {
    const body = await expectJson(await client.getProductById(product.id, token), 200);
    expect(body.stockQuantity, `Stock for owned product ${product.id}`).toBe(quantities[index]);
  }
}
