import { test, expect } from '../../fixtures/admin.fixture';
import { AdminProductFormPage, type AdminProductFormData } from '../../pages/AdminProductFormPage';
import { AdminProductsPage } from '../../pages/AdminProductsPage';

test.describe('Admin products mutation UI tests', () => {
  test('should create, edit, persist, and delete a disposable product', async ({ page }, testInfo) => {
    // given
    const adminProductsPage = new AdminProductsPage(page);
    const newProductFormPage = new AdminProductFormPage(page);
    const uniqueSuffix = `${Date.now()}-${testInfo.workerIndex}`;
    const product: AdminProductFormData = {
      name: `Codex UI Product ${uniqueSuffix}`,
      description: 'Disposable product created by the admin products UI workflow.',
      price: 12.34,
      stockQuantity: 7,
      category: 'UI Workflow',
      imageUrl: 'https://example.com/codex-ui-product.png'
    };
    const editedProduct: AdminProductFormData = {
      ...product,
      name: `${product.name} Edited`,
      description: 'Disposable product edited by the admin products UI workflow.',
      price: 45.67,
      stockQuantity: 11,
      category: 'UI Workflow Edited',
      imageUrl: 'https://example.com/codex-ui-product-edited.png'
    };

    try {
      await newProductFormPage.goto();
      await newProductFormPage.verifyLoaded('new');

      // when
      await newProductFormPage.fillProduct(product);
      await newProductFormPage.submit();
      await adminProductsPage.goto();

      // then
      await adminProductsPage.verifyProductListed(product);

      // when
      const productId = await adminProductsPage.editProduct(product.name);
      const editProductFormPage = AdminProductFormPage.edit(page, productId);
      await editProductFormPage.verifyLoaded('edit');
      await editProductFormPage.verifyValues(product);
      await editProductFormPage.fillProduct(editedProduct);
      await editProductFormPage.submit();
      await page.reload();

      // then
      await editProductFormPage.verifyValues(editedProduct);
      await adminProductsPage.goto();
      await adminProductsPage.verifyProductListed(editedProduct);

      // when
      await adminProductsPage.deleteProduct(editedProduct.name);

      // then
      await adminProductsPage.verifyProductNotListed(editedProduct.name);
    } finally {
      await deleteProductIfPresent(adminProductsPage, editedProduct.name);
      await deleteProductIfPresent(adminProductsPage, product.name);
    }
  });

  test('should show required field validation on the product form', async ({ page }) => {
    // given
    const productFormPage = new AdminProductFormPage(page);
    await productFormPage.goto();
    await productFormPage.verifyLoaded('new');

    // when
    await productFormPage.submit();

    // then
    await productFormPage.verifyRequiredFieldErrors();
    await expect(page).toHaveURL(productFormPage.url);
  });
});

async function deleteProductIfPresent(adminProductsPage: AdminProductsPage, productName: string) {
  await adminProductsPage.goto();

  if (await adminProductsPage.productRowByName(productName).count()) {
    await adminProductsPage.deleteProduct(productName);
  }
}
