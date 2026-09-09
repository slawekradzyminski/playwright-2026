import { test, expect } from '../../../fixtures/ui/productsUi.fixture';
import { ProductsPage } from '../../../pages/ProductsPage';

test.describe('Product catalog browsing', () => {
  let productsPage: ProductsPage;

  test.beforeEach(({ page }) => {
    productsPage = new ProductsPage(page);
  });

  for (const scenario of [
    { name: 'case-insensitive name', query: 'aLPHa', expected: ['alpha'] },
    { name: 'case-insensitive description', query: 'NEEDLE', expected: ['alpha', 'beta'] },
    { name: 'accented description', query: 'café', expected: ['alpha'] },
    { name: 'literal punctuation', query: '&', expected: ['alpha'] }
  ] as const) {
    test(`should search by ${scenario.name}`, async ({ catalog }) => {
      // given
      await productsPage.goto();
      await productsPage.category(catalog.categoryOne).click();

      // when
      await productsPage.search.fill(scenario.query);

      // then
      await expect(productsPage.names).toHaveText(scenario.expected.map(key => catalog[key].name));
    });
  }

  for (const scenario of [
    { option: 'name-asc', expected: ['alpha', 'beta', 'gamma'] },
    { option: 'name-desc', expected: ['gamma', 'beta', 'alpha'] },
    { option: 'price-asc', expected: ['alpha', 'gamma', 'beta'] },
    { option: 'price-desc', expected: ['beta', 'gamma', 'alpha'] }
  ] as const) {
    test(`should sort matching products by ${scenario.option}`, async ({ catalog }) => {
      // given
      await productsPage.goto();
      await productsPage.search.fill(catalog.key);

      // when
      await productsPage.sort.selectOption(scenario.option);

      // then
      await expect(productsPage.names).toHaveText(scenario.expected.map(key => catalog[key].name));
    });
  }

  test('should combine category, search and price sorting', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.search.fill(catalog.key);
    await productsPage.sort.selectOption('price-desc');

    // when
    await productsPage.category(catalog.categoryOne).click();

    // then
    await expect(productsPage.names).toHaveText([catalog.beta.name, catalog.alpha.name]);
    await expect(productsPage.listTitle).toHaveText(`${catalog.categoryOne} Products`);
    await expect(productsPage.search).toHaveValue(catalog.key);
    await expect(productsPage.sort).toHaveValue('price-desc');
  });

  test('should restore all categories while retaining search and sorting', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.category(catalog.categoryOne).click();
    await productsPage.search.fill(catalog.key);
    await productsPage.sort.selectOption('price-desc');

    // when
    await productsPage.allCategories.click();

    // then
    await expect(productsPage.names).toHaveText([catalog.beta.name, catalog.gamma.name, catalog.alpha.name]);
    await expect(productsPage.listTitle).toHaveText('All Products');
  });

  test('should show no results for literal regex characters', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.category(catalog.categoryOne).click();

    // when
    await productsPage.search.fill('[.*]');

    // then
    await expect(productsPage.empty).toContainText('No products found');
    await expect(productsPage.cards).toHaveCount(0);
    await expect(productsPage.resetSearch).toBeVisible();
  });

  for (const control of ['clearSearch', 'resetSearch'] as const) {
    test(`should recover from empty results using ${control}`, async ({ catalog }) => {
      // given
      await productsPage.goto();
      await productsPage.category(catalog.categoryOne).click();
      await productsPage.sort.selectOption('price-desc');
      await productsPage.search.fill('nonexistent-product-998811');
      await expect(productsPage.empty).toBeVisible();

      // when
      await productsPage[control].click();

      // then
      await expect(productsPage.search).toHaveValue('');
      await expect(productsPage.names).toHaveText([catalog.beta.name, catalog.alpha.name]);
      await expect(productsPage.sort).toHaveValue('price-desc');
      await expect(productsPage.empty).toBeHidden();
    });
  }

  test('should retain the filtered catalog when Enter is pressed', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);

    // when
    await productsPage.search.press('Enter');

    // then
    await productsPage.assertLoaded();
    await expect(productsPage.names).toHaveText([catalog.alpha.name]);
    await expect(productsPage.search).toHaveValue(catalog.alpha.name);
  });
});
