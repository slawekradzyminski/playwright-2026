import { test, expect } from '../../../fixtures/ui/productsUi.fixture';
import { ProductsPage } from '../../../pages/ProductsPage';
import { ProductDetailsPage } from '../../../pages/ProductDetailsPage';

test.describe('Product details', () => {
  let productsPage: ProductsPage;
  let detailsPage: ProductDetailsPage;

  test.beforeEach(({ page }) => {
    productsPage = new ProductsPage(page);
    detailsPage = new ProductDetailsPage(page);
  });

  test('should open matching product details from a catalog card', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);

    // when
    await productsPage.card(catalog.alpha.name).name.click();

    // then
    await detailsPage.assertLoaded(catalog.alpha.id);
    await expect(detailsPage.title).toHaveText(catalog.alpha.name);
    await expect(detailsPage.description).toHaveText(catalog.alpha.description);
    await expect(detailsPage.category).toHaveText(catalog.categoryOne);
    await expect(detailsPage.price).toHaveText('$9.99');
    await expect(detailsPage.stock).toHaveText('2 in stock');
  });

  test('should return to the catalog using Back to Products', async ({ catalog }) => {
    // given
    await detailsPage.goto(catalog.alpha.id);
    await detailsPage.assertLoaded(catalog.alpha.id);

    // when
    await detailsPage.back.click();

    // then
    await productsPage.assertLoaded();
    await expect(productsPage.card(catalog.alpha.name).root).toBeVisible();
  });

  test('should show an out-of-stock product on direct navigation', async ({ catalog }) => {
    // given
    const product = catalog.beta;

    // when
    await detailsPage.goto(product.id);

    // then
    await detailsPage.assertLoaded(product.id);
    await expect(detailsPage.title).toHaveText(product.name);
    await expect(detailsPage.stock).toHaveText('Out of stock');
    await expect(detailsPage.add).toBeDisabled();
  });
});
