import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import type { ProductDto } from '../types/product';

export class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  async expectUrl(id: number) {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}/products/${id}`);
  }

  async expectProduct(product: ProductDto) {
    const root = this.page.getByTestId('product-details-page');
    await expect(root.getByTestId('product-title')).toHaveText(product.name);
    await expect(root.getByTestId('product-price')).toHaveText(`$${product.price.toFixed(2)}`);
    await expect(root.getByTestId('product-description')).toHaveText(product.description);
  }
}
