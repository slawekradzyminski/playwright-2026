import { test, expect } from '../../fixtures/ui/loggedInUi.fixture';
import { ProductsPage } from '../../pages/ProductsPage';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';

test.describe('Product UI response states (simulated catalog responses)', () => {
  let productsPage: ProductsPage;
  let detailsPage: ProductDetailsPage;

  test.beforeEach(({ page }) => {
    productsPage = new ProductsPage(page);
    detailsPage = new ProductDetailsPage(page);
  });

  test('should display an empty catalog', async ({ page }) => {
    // given
    await page.route('**/api/v1/products', route => route.fulfill({ status: 200, json: [] }));

    // when
    await productsPage.goto();

    // then
    await expect(productsPage.empty).toContainText('No products found');
    await expect(productsPage.categoriesEmpty).toHaveText('No categories found (Total products: 0)');
    await expect(productsPage.cards).toHaveCount(0);
    await expect(productsPage.search).toBeVisible();
  });

  test('should show loading feedback then an empty result', async ({ page }) => {
    // given
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/v1/products', async route => {
      await gate;
      await route.fulfill({ status: 200, json: [] });
    });

    // when
    await productsPage.goto();

    // then
    try {
      await expect(productsPage.loading).toHaveText('Loading products...');
      await expect(productsPage.cards).toHaveCount(0);
    } finally {
      release();
    }
    await expect(productsPage.empty).toContainText('No products found');
    await expect(productsPage.loading).toBeHidden();
  });

  test('should display a server error and recover after reload', async ({ page }) => {
    // given
    await page.route('**/api/v1/products', route => route.fulfill({ status: 503, json: { message: 'Simulated unavailable' } }));
    await productsPage.goto();
    await expect(productsPage.error).toHaveText('Error loading products', { timeout: 15000 });
    await expect(productsPage.categoriesError).toHaveText('Error loading categories');
    await page.unroute('**/api/v1/products');
    await page.route('**/api/v1/products', route => route.fulfill({ status: 200, json: [] }));

    // when
    await page.reload();

    // then
    await expect(productsPage.empty).toContainText('No products found');
    await expect(productsPage.error).toBeHidden();
    await expect(productsPage.categoriesError).toBeHidden();
  });

  test('should offer catalog navigation when product details cannot load', async ({ page }) => {
    // given
    await page.route('**/api/v1/products/2147483647', route => route.fulfill({ status: 404, json: { message: 'Product not found' } }));
    await detailsPage.goto(2147483647);
    await expect(detailsPage.error).toBeVisible();

    // when
    await detailsPage.back.click();

    // then
    await productsPage.assertLoaded();
    await expect(productsPage.search).toBeVisible();
  });
});
