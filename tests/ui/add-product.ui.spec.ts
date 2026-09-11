import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('creates a product and exposes its saved values in the admin catalog', async ({ adminProductFormPage, adminProductsPage, shop, adminToken }) => {
  // given
  const values = { name: `New ${shop.category}`, description: 'Created through the product form', price: 19.75, stockQuantity: 7, category: shop.category };
  await adminProductFormPage.openNew();
  await adminProductFormPage.fill(values);

  // when
  const product = await adminProductFormPage.create();

  // then
  await adminProductFormPage.expectReset();
  await adminProductFormPage.expectPersisted(product.id, adminToken, values);
  await adminProductsPage.open();
  await adminProductsPage.expectProduct({ ...product, ...values });
});

test('denies clients access to product creation', async ({ adminProductFormPage, homePage }) => {
  // given
  await homePage.open();

  // when
  await adminProductFormPage.openNew();

  // then
  await adminProductFormPage.expectClientDenied();
});
