import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('identifies a low-stock product and opens the matching editor', async ({ adminDashboardPage, adminProductFormPage, shop }) => {
  // given
  const product = await shop.createProduct({ stockQuantity: 2 });
  await adminDashboardPage.open();
  await adminDashboardPage.expectLowStockProduct(product);

  // when
  await adminDashboardPage.editLowStockProduct(product.id);

  // then
  await adminProductFormPage.expectValues(product);
});

test('denies clients access to the admin dashboard', async ({ adminDashboardPage, homePage }) => {
  // given
  await homePage.open();

  // when
  await adminDashboardPage.open();

  // then
  await adminDashboardPage.expectClientDenied();
});
