import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('selects a product and records a stock adjustment with movement history', async ({ adminInventoryPage, product, adminToken }) => {
  // given
  await adminInventoryPage.open();
  await adminInventoryPage.search(product.name);
  await adminInventoryPage.selectProduct(product.id);
  await adminInventoryPage.expectSelected(product.name, 10);
  await adminInventoryPage.fillAdjustment(3, 'Received three replacement units');

  // when
  await adminInventoryPage.applyAdjustment();

  // then
  await adminInventoryPage.expectSelected(product.name, 13);
  await adminInventoryPage.expectMovement('Received three replacement units', 3);
  await adminInventoryPage.expectPersisted(product.id, adminToken, 13, 'Received three replacement units', 3);
});

test('denies clients access to inventory administration', async ({ adminInventoryPage, homePage, product }) => {
  // given
  await homePage.open();

  // when
  await adminInventoryPage.open();

  // then
  await adminInventoryPage.expectClientDenied();

  // when
  await adminInventoryPage.openProduct(product.id);

  // then
  await adminInventoryPage.expectClientDenied();
});
