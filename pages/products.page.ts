import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ProductCard } from './components/product-card.component';
import { Toast } from './components/toast.component';

export class ProductsPage extends BasePage {
  protected readonly path = '/products';
  readonly title: Locator;
  readonly productNames: Locator;
  readonly emptyMessage: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly toast: Toast;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('products-title');
    this.productNames = page.getByTestId('product-item').getByTestId('product-name');
    this.emptyMessage = page.getByTestId('no-products-message');
    this.searchInput = page.getByTestId('product-search');
    this.clearSearchButton = page.getByTestId('clear-search');
    this.toast = new Toast(page);
  }

  card(name: string) { return new ProductCard(this.page, name); }
  async goto() { await this.page.goto(this.path); }
  async reload() { await this.page.reload(); }
  async search(query: string) { await this.searchInput.fill(query); }
  async selectCategory(category: string) {
    await this.page.getByTestId('products-categories-list').getByRole('button', { name: category, exact: true }).click();
  }
  async showAllCategories() { await this.page.getByTestId('products-category-all').click(); }
  async showInStockOnly() { await this.page.getByTestId('product-in-stock-only').check(); }
  async sortByPrice(direction: 'ascending' | 'descending') {
    await this.page.getByTestId('product-sort').selectOption(direction === 'ascending' ? 'price-asc' : 'price-desc');
  }
  async clearEmptySearch() { await this.page.getByTestId('reset-search-button').click(); }
  async clearSearchWithKeyboard() {
    await this.clearSearchButton.focus();
    await this.clearSearchButton.press('Enter');
  }
}
