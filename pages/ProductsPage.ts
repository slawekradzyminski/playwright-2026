import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedInHeader } from './components/LoggedInHeader';
import { ProductCard } from './components/ProductCard';

export type ProductSort = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export class ProductsPage extends BasePage {
  protected readonly path = '/products';
  readonly header: LoggedInHeader;
  readonly title: Locator;
  readonly listTitle: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly resetSearchButton: Locator;
  readonly sortSelect: Locator;
  readonly inStockOnlyCheckbox: Locator;
  readonly productItems: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedInHeader(page);
    this.title = page.getByTestId('products-title');
    this.listTitle = page.getByTestId('product-list-title');
    this.searchInput = page.getByTestId('product-search');
    this.clearSearchButton = page.getByTestId('clear-search');
    this.resetSearchButton = page.getByTestId('reset-search-button');
    this.sortSelect = page.getByTestId('product-sort');
    this.inStockOnlyCheckbox = page.getByTestId('product-in-stock-only');
    this.productItems = page.getByTestId('product-item');
    this.productNames = this.productItems.getByTestId('product-name');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Products');
  }

  /** Test id is built from the category name: lowercase, spaces replaced with dashes. */
  categoryButton(category: string): Locator {
    return this.page.getByTestId(`products-category-${category.toLowerCase().replaceAll(' ', '-')}`);
  }

  productCard(name: string): ProductCard {
    return new ProductCard(this.productItems.filter({ has: this.page.getByTestId('product-name').getByText(name, { exact: true }) }));
  }

  async selectCategory(category: string) {
    await this.categoryButton(category).click();
  }

  async search(text: string) {
    await this.searchInput.fill(text);
  }

  async sortBy(sort: ProductSort) {
    await this.sortSelect.selectOption(sort);
  }
}
