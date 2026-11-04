import { expect, test } from '../../../fixtures/adminProducts.fixture';

test.describe('Admin dashboard UI tests', () => {
  test('should display dashboard sections and a newly created low-stock product', async ({ adminPage, createProduct }) => {
    // given
    const product = await createProduct({ stockQuantity: 3 });

    // when
    await adminPage.goto();

    // then
    await expect(adminPage.metrics).toBeVisible();
    await expect(adminPage.recentOrders).toBeVisible();
    await expect(adminPage.lowStock).toBeVisible();
    await expect(adminPage.productName(product.id)).toHaveText(product.name);
    await expect(adminPage.productStock(product.id)).toHaveText('3 in stock');
  });

  test.describe('anonymous access', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('should redirect to sign in', async ({ page, loginPage }) => {
      // when
      await page.goto('/admin');
      // then
      await loginPage.expectToBeOpen();
    });
  });
});
