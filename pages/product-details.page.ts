import type { Page } from '@playwright/test';
import { Toast } from './components/toast.component';

export class ProductDetailsPage {
  readonly toast: Toast;

  constructor(private readonly page: Page) {
    this.toast = new Toast(page);
  }
  get title() { return this.page.getByTestId('product-title'); }
  get description() { return this.page.getByTestId('product-description'); }
  get category() { return this.page.getByTestId('product-category'); }
  get price() { return this.page.getByTestId('product-price'); }
  get stock() { return this.page.getByTestId('product-stock'); }
  get quantity() { return this.page.getByTestId('quantity-value'); }
  get inCart() { return this.page.getByTestId('product-cart-quantity'); }
  get saveButton() { return this.page.getByTestId('add-to-cart'); }
  get removeButton() { return this.page.getByTestId('remove-from-cart'); }
  get error() { return this.page.getByTestId('product-not-found'); }
  async goto(id: number) { await this.page.goto(`/products/${id}`); }
  async increase() { await this.page.getByTestId('increase-quantity').click(); }
  async decrease() { await this.page.getByTestId('decrease-quantity').click(); }
  async save() { await this.saveButton.click(); }
  async remove() { await this.removeButton.click(); }
  async back() { await this.page.getByRole('link', { name: /back to products/i }).click(); }
}
