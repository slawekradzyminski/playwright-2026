import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import { GetProductByIdClient } from '../clients/products/get-product-by-id-client';
import type { ProductCreateDto, ProductDto } from '../types/product';

type ProductFields = Omit<ProductCreateDto, 'imageUrl'> & { imageUrl?: string | null };

export class AdminProductFormPage {
  constructor(private readonly page: Page) {}
  async openNew() { await this.page.goto(`${APP_BASE_URL}/admin/products/new`); }
  async openEdit(id: number) { await this.page.goto(`${APP_BASE_URL}/admin/products/edit/${id}`); }
  async reload() { await this.page.reload(); }
  async fill(product: ProductFields) {
    for (const [field, value] of Object.entries({ name: product.name, description: product.description ?? '', price: product.price, stock: product.stockQuantity, category: product.category, image: product.imageUrl ?? '' })) {
      await this.page.getByTestId(`product-${field}-input`).fill(String(value));
    }
  }
  async create(): Promise<ProductDto> {
    const response = this.page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/products' && r.request().method() === 'POST');
    await this.page.getByTestId('product-submit-button').click();
    return (await response).json();
  }
  async save(id: number) {
    const response = this.page.waitForResponse(r => new URL(r.url()).pathname === `/api/v1/products/${id}` && r.request().method() === 'PUT');
    await this.page.getByTestId('product-submit-button').click();
    await response;
  }
  async expectValues(product: ProductFields) {
    for (const [field, value] of Object.entries({ name: product.name, description: product.description ?? '', price: product.price, stock: product.stockQuantity, category: product.category })) {
      await expect(this.page.getByTestId(`product-${field}-input`)).toHaveValue(String(value));
    }
  }
  async expectReset() { await expect(this.page.getByTestId('product-name-input')).toHaveValue(''); }
  async expectPersisted(id: number, token: string, product: ProductFields) {
    const response = await new GetProductByIdClient(this.page.request).get(id, token);
    expect(response.status()).toBe(200);
    const { name, description, price, stockQuantity, category } = product;
    expect(await response.json()).toMatchObject({ name, description, price, stockQuantity, category });
  }
  async expectClientDenied() {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}/`);
    await expect(this.page.getByTestId('product-form')).toHaveCount(0);
  }

}
