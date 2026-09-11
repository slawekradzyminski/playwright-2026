import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('lists a disposable product and deletes it only after confirmation', async ({ adminProductsPage, product, adminToken }) => {
  // given
  await adminProductsPage.open();
  await adminProductsPage.expectProduct(product);

  // when
  await adminProductsPage.remove(product.id, false);

  // then
  await adminProductsPage.expectProduct(product);

  // when
  await adminProductsPage.remove(product.id, true);

  // then
  await adminProductsPage.expectRemoved(product.id, adminToken);
});

test('denies clients access to catalog administration', async ({ adminProductsPage, homePage }) => {
  // given
  await homePage.open();

  // when
  await adminProductsPage.open();

  // then
  await adminProductsPage.expectClientDenied();
});
