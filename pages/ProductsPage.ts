import { expect, type Locator, type Page } from '@playwright/test';
import { ProductCard } from './components/ProductCard';
import { LoggedInPage } from './LoggedInPage';

export class ProductsPage extends LoggedInPage {
  readonly root: Locator;
  readonly title: Locator;

  readonly search: Locator;
  readonly sort: Locator;
  readonly clearSearch: Locator;
  readonly resetSearch: Locator;
  readonly cards: Locator;
  readonly names: Locator;
  readonly allCategories: Locator;
  readonly listTitle: Locator;
  readonly empty: Locator;
  readonly loading: Locator;
  readonly error: Locator;
  readonly categoriesEmpty: Locator;
  readonly categoriesError: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('products-page');
    this.title = this.root.getByTestId('products-title');
    this.search = this.root.getByTestId('product-search');
    this.sort = this.root.getByTestId('product-sort');
    this.clearSearch = this.root.getByTestId('clear-search');
    this.resetSearch = this.root.getByTestId('reset-search-button');
    this.cards = this.root.getByTestId('product-item');
    this.names = this.cards.getByTestId('product-name');
    this.allCategories = this.root.getByTestId('products-category-all');
    this.listTitle = this.root.getByTestId('product-list-title');
    this.empty = this.root.getByTestId('no-products-message');
    this.loading = this.root.getByTestId('product-list-loading');
    this.error = this.root.getByTestId('error-message');
    this.categoriesEmpty = this.root.getByTestId('products-categories-empty');
    this.categoriesError = this.root.getByTestId('products-categories-error');
  }

  async goto() {
    await this.page.goto('/products');
  }

  category(name: string) {
    return this.root.getByTestId('products-categories-list').getByRole('button', { name, exact: true });
  }

  card(name: string) {
    return new ProductCard(this.cards.filter({ has: this.page.getByRole('heading', { name, exact: true }) }));
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/products');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Products');
    await expect(this.title).toBeVisible();
  }
}
