import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('edits a disposable product and persists all catalog fields', async ({ adminProductFormPage, adminProductsPage, product, adminToken }) => {
  // given
  const values = { ...product, name: `Edited ${product.name}`, description: 'Updated description', price: 24.75, stockQuantity: 6 };
  await adminProductsPage.open();
  await adminProductsPage.edit(product.id);
  await adminProductFormPage.expectValues(product);
  await adminProductFormPage.fill(values);

  // when
  await adminProductFormPage.save(product.id);

  // then
  await adminProductFormPage.expectPersisted(product.id, adminToken, values);
  await adminProductFormPage.reload();
  await adminProductFormPage.expectValues(values);
  await adminProductsPage.open();
  await adminProductsPage.expectProduct(values);
});

test('denies clients access to editing an existing product', async ({ adminProductFormPage, product }) => {
  // given
  const productId = product.id;

  // when
  await adminProductFormPage.openEdit(productId);

  // then
  await adminProductFormPage.expectClientDenied();
});
